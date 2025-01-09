import { showConfirmationModal } from "./dom/modal";
import subscribe from "./dom/subscribe";

interface WebPushSDKOptions {
  webPushKey: string;
  userID?: string | number;
}

interface Configuration {
  ApplicationServerKey: string;
  Ask: "hard" | "soft" | "custom";
  AskSelector?: string;
  AskEvent?: "click" | "hover" | string;
}
class WebPushSDK {
  options: WebPushSDKOptions;
  private configuration: Configuration | null = null;
  serviceWorkerReg: null | ServiceWorkerRegistration;
  constructor(options: WebPushSDKOptions) {
    this.options = options;
    this.serviceWorkerReg = null;
    this.initialize();
  }

  async getConfigurations(): Promise<Configuration> {
    if (this.configuration === null) {
      try {
        const response = await fetch(
          `http://localhost:8080/info/${this.options.webPushKey}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch configuration: ${response.statusText}`
          );
        }
        this.configuration = await response.json();
      } catch (error) {
        console.error("Error fetching configuration:", error);
        throw error; // Rethrow to let the caller handle it
      }
    }

    if (this.configuration === null) {
      throw new Error("Error fetching configuration");
    }
    return this.configuration;
  }

  private async initialize() {
    const configuration = await this.getConfigurations();

    switch (configuration.Ask) {
      case "hard":
        this.handlePushNotifications();
        return;
      case "soft":
        showConfirmationModal(
          "Do you want to enable push notifications?",
          this.handlePushNotifications.bind(this)
        );
        return;
      case "custom":
      default:
        if (!configuration.AskSelector || !configuration.AskEvent) {
          throw new Error(
            "$options.AskSelector or $options.AskEvent is required in custom Ask."
          );
        }
        subscribe(
          configuration.AskSelector,
          configuration.AskEvent,
          this.handlePushNotifications.bind(this)
        );
        return;
    }
  }

  public async subscribe() {
    await this.handlePushNotifications();
  }

  private async handlePushNotifications() {
    const configuration = await this.getConfigurations();
    await this.registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: configuration.ApplicationServerKey,
    });
    const body = {
      subscription,
      userID: this.options.userID || crypto.randomUUID(),
    };
    await fetch("http://localhost:8080/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      this.serviceWorkerReg = await navigator.serviceWorker.register(
        "./service-worker.js"
      );
    }
  }
}
export default WebPushSDK;
