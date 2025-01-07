export const showConfirmationModal = (title: string, onConfirm: () => void) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    const content = document.createElement('div');
    content.style.backgroundColor = '#fff';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

    const message = document.createElement('p');
    message.textContent = title;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.style.marginRight = '10px';
    confirmButton.style.padding = '10px 20px';
    confirmButton.style.border = 'none';
    confirmButton.style.backgroundColor = '#4CAF50';
    confirmButton.style.color = '#fff';
    confirmButton.style.borderRadius = '5px';
    confirmButton.style.cursor = 'pointer';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.border = 'none';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = '#fff';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';

    content.appendChild(message);
    content.appendChild(confirmButton);
    content.appendChild(cancelButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
    confirmButton.addEventListener('click', () => {
        document.body.removeChild(modal); 
        onConfirm();
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal); 
    });
}