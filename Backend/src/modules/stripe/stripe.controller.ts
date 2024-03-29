import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpException,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { UserService } from "../user/user.service";

@Controller("stripe")
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService
  ) {}
  @Post("create-checkout-session-subscription")
  async createCheckoutSessionSubscription(
    @Body("membershipId") membershipId: number,
    @Body("userId") userId: number
  ): Promise<{ sessionId: string } | { error: string }> {
    const session = await this.stripeService.createCheckoutSessionSubscription(
      membershipId,
      userId
    );

    if ("error" in session) {
      return { error: "error" };
    }

    return { sessionId: session.id };
  }

  @Post("create-checkout-session-screen")
  async createCheckoutSessionScreen(
    @Body("screenName") screenName: string,
    @Body("userId") userId: number
  ) {
    const company = await this.userService.findOne(userId);

    console.log(company);
    const screenLimitCompany = company.data.screenLimit;
    const screenLength = company.data.screens.length;


    if (screenLength >= screenLimitCompany) {
      throw new HttpException("SCREEN_LIMIT_EXCEEDED", 400);
    }

    const session = await this.stripeService.createCheckoutSessionScreen(
      screenName,
      userId
    );
    return { sessionId: session.id };
  }
  @Post("create-checkout-session-package")
  async createCheckoutSessionPackage(
    @Body("packageId") packageId: number,
    @Body("userId") userId: number
  ) {


    const session = await this.stripeService.createCheckoutSessionPackage(
      packageId,
      userId
    );
    return { sessionId: session.id };
  }

  @Post("checkout-session-subscription")
  async getCheckoutSession(@Body("sessionId") sessionId: string) {
    try {
      const session = await this.stripeService.getCheckoutSession(sessionId);

      if (session.payment_status === "paid") {
      }
      return session;
    } catch (error) {
      return { error: error.message };
    }
  }
  @Post("checkout-session-rockobits")
  async getCheckoutSessionRockobits(@Body("sessionId") sessionId: string) {
    try {
      const session = await this.stripeService.getCheckoutSessionRockobits(sessionId);

      if (session.payment_status === "paid") {
      }
      return session;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post("webhook")
  async handleWebhookEvent(
    @Headers("stripe-signature") signature: string,
    @Req() request: any
  ) {
    try {
      if (!signature) {
        throw new BadRequestException("Missing stripe-signature header");
      }

      const event = await this.stripeService.constructEventFromPayload(
        signature,
        request.rawBody
      );
      if (!event) throw new BadRequestException("Invalid Stripe signature");

      // Procesar el evento

      if ("metadata" in event.data.object) {
        // Obtener información adicional de la metadata

        const purchaseType = event.data.object.metadata.pucharseType;
        console.log(purchaseType);

        // Verificar el tipo de compra
        switch (purchaseType) {
          case "subscription":
            console.log("Procesar evento de suscripción");
            const processedEvent =
              await this.stripeService.processWebhookEventSubscription(event);
            break;
          case "screen":
            console.log("Procesar evento de pantalla");
            const processedEventScreen =
              await this.stripeService.processWebhookEventScreen(event);
            break;
          case "package":
            console.log("Procesar evento de la compra de rockobits");
            const processedEventPackage =
              await this.stripeService.processWebhookEventPackage(event);
            break;
          // Otros casos según tus necesidades

          default:
            console.log(`Unhandled purchase type: ${purchaseType}`);
        }
      }

      // Devolver una respuesta exitosa al servidor de Stripe
      return { received: true };
    } catch (error) {
      console.error("Error processing webhook event:", error.message);
      return { error: "Failed to process webhook event" };
    }
  }
}
