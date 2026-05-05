async function loadComponents() {
    try {
        // 1. Tell JS to look inside the components folder
        const headerResponse = await fetch('components/header.html');
        if (!headerResponse.ok) throw new Error("CORS or File Not Found");
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        // 2. Tell JS to look inside the components folder here too
        const footerResponse = await fetch('components/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
    } catch (error) {
        console.error('Error loading components:', error);
        document.getElementById('header-placeholder').innerHTML = 
            `<div style="background: red; color: white; padding: 1rem; text-align: center; font-weight: bold;">
             ERROR: Header/Footer blocked or path is incorrect. Make sure your local server is running!
             </div>`;
    }
}

function initAnimations() {
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents().then(() => initAnimations());
});