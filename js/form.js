window.initForm = () => {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const TELEGRAM_BOT_TOKEN = '8785035886:AAGuF17Bk0bhiRU_tn0IVdl175wB3ovu6iU';
            const TELEGRAM_CHAT_ID = '892874995';

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            if (name && email && subject && message) {
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;

                submitBtn.innerText = 'Sending...';
                submitBtn.disabled = true;

                const text = `🚀 *New Portfolio Inquiry*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📂 *Subject:* ${subject}\n\n📝 *Message:*\n${message}`;


                try {
                    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: TELEGRAM_CHAT_ID,
                            text: text,
                            parse_mode: 'Markdown',
                        }),
                    });

                    const formMessage = document.getElementById('form-message');
                    
                    if (response.ok) {
                        formMessage.textContent = 'Thank you! Your message has been sent.';
                        formMessage.className = 'form-message success';
                        formMessage.style.display = 'block';
                        form.reset();
                        setTimeout(() => {
                            formMessage.style.display = 'none';
                        }, 5000);
                    } else {
                        throw new Error('Telegram API error');
                    }
                } catch (error) {
                    console.error('Submission error:', error);
                    const formMessage = document.getElementById('form-message');
                    formMessage.textContent = 'Oops! Something went wrong. Please try again later.';
                    formMessage.className = 'form-message error';
                    formMessage.style.display = 'block';
                } finally {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }

            } else {
                alert('Please fill in all fields.');
            }
        });

        // Input focus effects
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const parent = input.parentElement;
            input.addEventListener('focus', () => parent.classList.add('focused'));
            input.addEventListener('blur', () => {
                if (input.value === '') parent.classList.remove('focused');
            });
        });
    }
};

