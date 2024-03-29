import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership } from "src/entities/membership.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ScreenService } from "../screen/screen.service";
import { PackageRockobits } from "src/entities/packageRockobits.entity";
import { WalletService } from "../wallet/wallet.service";
import { TransactionsService } from "../transactions/transactions.service";
import { generateTransactionDescription } from "src/utils/genereateDescriptionTransaction";
import { TYPE_TRANSACTION } from "src/constants/typeTransaction.enum";
const configService = new ConfigService();

@Injectable()
export class StripeService {
  private readonly stripe = new Stripe(configService.get("STRIPE_KEY"), {
    apiVersion: "2023-10-16",
  });

  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(PackageRockobits)
    private readonly packageRockobitsRepository: Repository<PackageRockobits>,
    private readonly userService: UserService,
    private readonly screenService: ScreenService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionsService
  ) {}

  async createCheckoutSessionSubscription(
    membershipId: number,
    userId: number
  ): Promise<Stripe.Checkout.Session | { error: string }> {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
    });
    if (!membership)
      throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND);

    const user = await this.userService.findOne(userId);
    if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);

    if (user.data.activeMembership) {
      throw new HttpException(
        "USER_HAS_ACTIVE_MEMBERSHIP",
        HttpStatus.BAD_REQUEST
      );
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: `${membership.price}`,
          quantity: 1,
        },
      ],
      success_url: `${configService.get(
        "URL_FRONT_COMPANY"
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${configService.get("URL_FRONT_COMPANY")}/subscriptions`,
      metadata: {
        userId: userId,
        membershipId: membership.id,
        membership_name: membership.name,
        membership_type: membership.type,
        membership_expiration: nextMonth.toISOString(),
        pucharseType: "subscription",
      },
    });
    return session;
  }

  async createCheckoutSessionScreen(name: string, userId: number) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Compra de Pantalla Extra",
            },
            unit_amount: 200,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${configService.get("URL_FRONT_COMPANY")}/screens`,
      cancel_url: `${configService.get("URL_FRONT_COMPANY")}/screen/cancel`,
      metadata: {
        screenName: name,
        userId: userId,
        pucharseType: "screen",
      },
    });
    return session;
  }
  async createCheckoutSessionPackage(packageId: number, userId: number) {
    const company = await this.userService.findOne(userId);
    const packageFound = await this.packageRockobitsRepository.findOne({
      where: { id: packageId },
    });

    if (!packageFound) {
      throw new HttpException("PACKAGE_NOT_FOUND", 400);
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${packageFound.rockobitsAmount} Rockobits`,
            },
            unit_amount: packageFound.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${configService.get(
        "URL_FRONT_COMPANY"
      )}/rockobits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${configService.get("URL_FRONT_COMPANY")}/rockobits/cancel`,
      metadata: {
        packageId: packageId,
        userId: userId,
        pucharseType: "package",
      },
    });
    return session;
  }

  async getCheckoutSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }
  async getCheckoutSessionRockobits(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async createStripePrice(
    name: string,
    amount: number,
    currency: string,
    productType: string
  ) {
    try {
      let recurring: any = {};

      // Configuración específica para productos recurrentes por ejemplo membresías
      if (productType === "membership") {
        recurring = {
          interval: "month",
        };
      }

      const price = await this.stripe.prices.create({
        recurring,
        unit_amount: amount,
        currency,
        product_data: {
          name,
        },
      });

      return price;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async updateStripePrice(
    priceId: string,
    newAmount: number,
    newName: string,
    newCurrency: string
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);

      // Crea un nuevo precio con las actualizaciones
      const updatedPrice = await this.stripe.prices.create({
        recurring: {
          interval: "month",
        },
        unit_amount: newAmount,
        currency: newCurrency,
        product_data: {
          name: newName,
        },
      });

      // Desactiva el precio existente
      await this.stripe.prices.update(priceId, {
        active: false,
      });

      return updatedPrice;
    } catch (error) {
      console.error("Error al actualizar el precio en Stripe:", error);
      throw new HttpException(error.message, error.statusCode);
    }
  }
  constructEventFromPayload(signature: string, payload: Buffer) {
    const secret = configService.get("STRIPE_WEBHOOK_SECRET");
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async processWebhookEventSubscription(event: any): Promise<any> {
    if (event.type === "checkout.session.completed") {
      const idUser = event.data.object.metadata.userId;
      const idMembership = event.data.object.metadata.membershipId;

      const response = await this.userService.activateMembership(
        idUser,
        idMembership
      );
    }
  }
  async processWebhookEventScreen(event: any): Promise<any> {
    if (event.type === "checkout.session.completed") {
      const idUser = event.data.object.metadata.userId;

      const response = await this.screenService.createScreen({
        idCompany: idUser,
        name: event.data.object.metadata.screenName,
        password: "1234",
      });
    }
  }
  async processWebhookEventPackage(event: any): Promise<any> {
    if (event.type === "checkout.session.completed") {
      console.log(event.data.object.metadata);
      const companyFound = await this.userService.findOneWithWallet(
        event.data.object.metadata.userId
      );
      const packageFound = await this.packageRockobitsRepository.findOne({
        where: { id: event.data.object.metadata.packageId },
      });
      console.log(companyFound.data.wallet.id);
      this.walletService.addAmount(
        companyFound.data.wallet.id,
        packageFound.rockobitsAmount
      );

      this.transactionService.createForRechargeWallet({
        amount: packageFound.rockobitsAmount,
        idUser: companyFound.data.id,
        type: TYPE_TRANSACTION.COMPRE,
        description: generateTransactionDescription(TYPE_TRANSACTION.COMPRE, {
          amount: packageFound.rockobitsAmount,
          companyName: companyFound.data.name,
        }),
      });
    }
  }
}
