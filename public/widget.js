// public/widget.js
(function() {
  // Get the script tag
  const scriptTag = document.currentScript || (() => {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  // Get configuration
  const config = {
    botId: scriptTag.dataset.botId,
    primaryColor: scriptTag.dataset.primaryColor || '#3B82F6',
    theme: scriptTag.dataset.theme || 'dark',
    title: scriptTag.dataset.title || 'Chat Assistant',
    position: scriptTag.dataset.position || 'bottom-right',
    welcomeMessage: scriptTag.dataset.welcomeMessage || 'How can I help you today?',
    buttonIcon: scriptTag.dataset.buttonIcon || 'chat',
    height: parseInt(scriptTag.dataset.height || '500', 10),
    width: parseInt(scriptTag.dataset.width || '350', 10)
  };
  
  // Base API URL
  const apiUrl = scriptTag.src.split('/widget.js')[0];
  
  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    .echonest-widget-button {
      position: fixed;
      z-index: 999999;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s;
    }
    
    .echonest-widget-button:hover {
      transform: scale(1.05);
    }
    
    .echonest-widget-button svg {
      fill: white;
      width: 28px;
      height: 28px;
    }
    
    .echonest-widget-container {
      position: fixed;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      overflow: hidden;
      display: none;
      flex-direction: column;
    }
    
    .echonest-widget-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .echonest-widget-close {
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    .echonest-widget-close:hover {
      opacity: 1;
    }
    
    .echonest-widget-iframe {
      border: none;
      flex: 1;
    }
    
    .echonest-widget-dark {
      background-color: #1f2937;
      color: white;
    }
    
    .echonest-widget-light {
      background-color: white;
      color: #1f2937;
    }
    
    /* Positions */
    .echonest-position-bottom-right .echonest-widget-button {
      right: 20px;
      bottom: 20px;
    }
    
    .echonest-position-bottom-right .echonest-widget-container {
      right: 20px;
      bottom: 90px;
    }
    
    .echonest-position-bottom-left .echonest-widget-button {
      left: 20px;
      bottom: 20px;
    }
    
    .echonest-position-bottom-left .echonest-widget-container {
      left: 20px;
      bottom: 90px;
    }
    
    .echonest-position-top-right .echonest-widget-button {
      right: 20px;
      top: 20px;
    }
    
    .echonest-position-top-right .echonest-widget-container {
      right: 20px;
      top: 90px;
    }
    
    .echonest-position-top-left .echonest-widget-button {
      left: 20px;
      top: 20px;
    }
    
    .echonest-position-top-left .echonest-widget-container {
      left: 20px;
      top: 90px;
    }
  `;
  document.head.appendChild(style);
  
  // Create container
  const widgetContainer = document.createElement('div');
  widgetContainer.className = `echonest-widget-container echonest-widget-${config.theme}`;
  widgetContainer.style.width = `${config.width}px`;
  widgetContainer.style.height = `${config.height}px`;
  
  // Create header
  const header = document.createElement('div');
  header.className = 'echonest-widget-header';
  header.innerHTML = `
    <div class="echonest-widget-title">${config.title}</div>
    <div class="echonest-widget-close">✕</div>
  `;
  
  // Create iframe for the chat interface
  const iframe = document.createElement('iframe');
  iframe.className = 'echonest-widget-iframe';
  iframe.src = `${apiUrl}/embed-chat?botId=${config.botId}&theme=${config.theme}&primaryColor=${encodeURIComponent(config.primaryColor)}`;
  
  // Assemble the container
  widgetContainer.appendChild(header);
  widgetContainer.appendChild(iframe);
  
  // Create button with appropriate icon
  const button = document.createElement('div');
  button.className = 'echonest-widget-button';
  button.style.backgroundColor = config.primaryColor;
  
  // Icon based on configuration
  let iconSvg;
  switch (config.buttonIcon) {
    case 'message':
      iconSvg = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
      break;
    case 'help':
      iconSvg = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.35-.43.58-.79.58-.5 0-.86-.51-.71-.99.13-.39.32-.75.58-1.08C9.66 6.77 11.21 6 13 6c3 0 4 2.07 4 3.4 0 1.1-.96 2.14-1.93 2.85z"/></svg>';
      break;
    case 'chat':
    default:
      iconSvg = '<svg viewBox="0 0 24 24"><path d="M12 1.95c-5.52 0-10 4.48-10 10s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.43c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57v-1.43c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';
  }
  button.innerHTML = iconSvg;
  
  // Add positioning wrapper
  const positionWrapper = document.createElement('div');
  positionWrapper.className = `echonest-position-${config.position}`;
  positionWrapper.appendChild(button);
  positionWrapper.appendChild(widgetContainer);
  
  // Add to page
  document.body.appendChild(positionWrapper);
  
  // Add event listeners
  button.addEventListener('click', () => {
    widgetContainer.style.display = 'flex';
    button.style.display = 'none';
    
    // Send welcome message (if first time)
    if (!iframe.dataset.loaded) {
      iframe.dataset.loaded = 'true';
      
      // Wait for iframe to load
      iframe.onload = () => {
        // Post welcome message to iframe
        iframe.contentWindow.postMessage({
          type: 'ECHONEST_WELCOME',
          message: config.welcomeMessage
        }, '*');
      };
    }
  });
  
  // Close button
  header.querySelector('.echonest-widget-close').addEventListener('click', () => {
    widgetContainer.style.display = 'none';
    button.style.display = 'flex';
  });
})();