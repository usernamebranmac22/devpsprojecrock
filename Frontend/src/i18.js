// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const storedLanguage = localStorage.getItem("language");

i18n.use(initReactI18next).init({
  resources: {
    us: {
      translation: {
        title_dashboard: "Dashboard",
        title_graphics: "Graphics",
        menu_dashboard: "Dashboard",
        menu_graphics: "Graphics",
        menu_users: "Users",
        menu_transactions: "Transactions",
        menu_help: "Help",
        menu_companies: "Companies",
        menu_clients: "Clients",
        menu_moderators: "Moderators",
        dashboard_welcome: "Welcome,",
        dashboard_sales: "Sales",
        dashboard_clients: "Clients",
        dashboard_companies: "Companies",
        dashboard_videos: "Videos playing",
        dashboard_last_orders: "Last orders",
        dashboard_table_order: "Order",
        dashboard_table_client: "Client",
        dashboard_table_amount: "Amount",
        dashboard_table_state: "State",
        dashboard_table_date: "Date",
        users_companies_title: "Companies",
        users_clients_title: "Clients",
        users_moderators_title: "Moderators",
      },
    },
    es: {
      translation: {
        title_dashboard: "Panel Administrativo",
        title_graphics: "Graficas",
        menu_dashboard: "Panel",
        menu_graphics: "Graficas",
        menu_users: "Usuarios",
        menu_transactions: "Transacciones",
        menu_help: "Ayuda",
        menu_companies: "Empresas",
        menu_clients: "Clientes",
        menu_moderators: "Moderadores",
        dashboard_welcome: "Bienvenido,",
        dashboard_sales: "Ventas",
        dashboard_clients: "Usuarios Clientes",
        dashboard_companies: "Usuarios Empresas",
        dashboard_videos: "En reproducción",
        dashboard_last_orders: "Últimos pedidos",
        dashboard_table_order: "ORDEN",
        dashboard_table_client: "CLIENTE",
        dashboard_table_amount: "CANTIDAD",
        dashboard_table_state: "ESTADO",
        dashboard_table_date: "FECHA",
        users_companies_title: "Empresas",
        users_clients_title: "Clientes",
        users_moderators_title: "Moderadores",
      },
    },
    pt: {
      translation: {
        title_dashboard: "Painel Administrativo",
        title_graphics: "Gráficos",
        menu_dashboard: "Painel",
        menu_graphics: "Gráficos",
        menu_users: "Usuários",
        menu_transactions: "Transações",
        menu_help: "Ajuda",
        menu_companies: "Empresas",
        menu_clients: "Clientes",
        menu_moderators: "Moderadores",
        dashboard_welcome: "Bem-vindo,",
        dashboard_sales: "Vendas",
        dashboard_clients: "Clientes",
        dashboard_companies: "Empresas",
        dashboard_videos: "em reprodução",
        dashboard_last_orders: "Últimos pedidos",
        dashboard_table_order: "ORDEM",
        dashboard_table_client: "CLIENTE",
        dashboard_table_amount: "QUANTIDADE",
        dashboard_table_state: "ESTADO",
        dashboard_table_date: "DATA",
        users_companies_title: "Empresas",
        users_clients_title: "Clientes",
        users_moderators_title: "Moderadores",
      },
    },
  },
  lng: storedLanguage || "us",
  fallbackLng: "us",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
