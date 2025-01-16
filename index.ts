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

interface UserInformation {
  isSubscribed: boolean;
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

  async getUserInformation(): Promise<UserInformation> {
    const response = await fetch(
      `http://localhost:8080/users/${this.options.userID}`
    );

    return await response.json();
  }

  private async initialize() {
    if (Notification.permission === "denied") {
      // Handle deny case.. maybe show a modal informing how can allow information
      // Should be configured through dashboard
      console.error('WebPushSDK:Notification is denied.')
      return;
    }

    const userInformation = await this.getUserInformation();


    if(Notification.permission === 'granted' && userInformation.isSubscribed === true){
        console.log('WebPushSDK: All good!')
        return;
    }

    if (Notification.permission === 'granted' && userInformation.isSubscribed === false) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      subscription ? this.storeSubscription(subscription) : this.handlePushNotifications()
      return;
    }

    const configuration = await this.getConfigurations();

    switch (configuration.Ask) {
      case "hard":
        this.subscribe();
        return;
      case "soft":
        showConfirmationModal(
          "Do you want to enable push notifications?",
          this.subscribe.bind(this)
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
          this.subscribe.bind(this)
        );
        return;
    }
  }

  async subscribe() {
    await this.registerServiceWorker();
    await this.handlePushNotifications();
  }

  private async storeSubscription(subscription: PushSubscription) {
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

  private async handlePushNotifications() {
    const configuration = await this.getConfigurations();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: configuration.ApplicationServerKey,
    });
    await this.storeSubscription(subscription)
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
