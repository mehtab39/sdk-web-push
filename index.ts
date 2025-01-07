import { showConfirmationModal } from "./dom/modal";
import subscribe from "./dom/subscribe";

interface WebPushSDKOptions {
  ask: "hard" | "soft" | "custom";
  applicationServerKey: string;
  askSelector?: string;
  askEvent?: "click" | "hover" | string;
  userID?: string | number;
}

class WebPushSDK {
  options: WebPushSDKOptions;
  serviceWorkerReg: null | ServiceWorkerRegistration;
  constructor(options: WebPushSDKOptions) {
    this.options = options;
    this.serviceWorkerReg = null;

    switch (this.options.ask) {
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
        if(!this.options.askSelector || !this.options.askEvent){
             throw new Error('$options.askSelector or $options.askEvent is required in custom ask.')
        }
        subscribe(
          this.options.askSelector,
          this.options.askEvent,
          this.handlePushNotifications.bind(this)
        );
        return;
    }
  }

  public async subscribe() {
    await this.handlePushNotifications();
  }

  private async handlePushNotifications() {
    await this.registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.options.applicationServerKey,
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
