const subscribe = (selector: string, event: string, handler: () => void) => {
    const element = document.querySelector(selector);
    if(element){
        element.addEventListener(event, handler);
    }
}

export default subscribe;