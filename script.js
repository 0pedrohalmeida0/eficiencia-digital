(function() {
    // Verificar se o usuário prefere movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Configuração
    const config = {
        particleCount: 80, // Número de partículas (ajustado para performance)
        particleSize: 2,
        particleColor: 0x2563eb, // --primary-color
        connectionDistance: 150,
        connectionOpacity: 0.15,
        speed: 0.3,
        mouseInteraction: true,
        mouseDistance: 200,
        mobileParticleCount: 40 // Menos partículas em mobile
    };

    // Detectar mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        config.particleCount = config.mobileParticleCount;
        config.connectionDistance = 100;
        config.speed = 0.2;
    }

    // Cena, câmera e renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar para performance

    camera.position.z = 300;

    // Criar partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = config.particleCount;
    const posArray = new Float32Array(particlesCount * 3);
    const velArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Posição aleatória
        posArray[i] = (Math.random() - 0.5) * window.innerWidth;
        posArray[i + 1] = (Math.random() - 0.5) * window.innerHeight;
        posArray[i + 2] = (Math.random() - 0.5) * 500;

        // Velocidade aleatória
        velArray[i] = (Math.random() - 0.5) * config.speed;
        velArray[i + 1] = (Math.random() - 0.5) * config.speed;
        velArray[i + 2] = (Math.random() - 0.5) * config.speed * 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: config.particleSize,
        color: config.particleColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Criar linhas de conexão
    const linesMaterial = new THREE.LineBasicMaterial({
        color: config.particleColor,
        transparent: true,
        opacity: config.connectionOpacity,
        blending: THREE.AdditiveBlending
    });

    let linesGeometry = new THREE.BufferGeometry();
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    let targetMouse = new THREE.Vector2();

    if (config.mouseInteraction) {
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            targetMouse.x = mouse.x * 300;
            targetMouse.y = mouse.y * 300;
        });
    }

    // Atualizar conexões
    function updateConnections() {
        const positions = particlesGeometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            for (let j = i + 1; j < particlesCount; j++) {
                const j3 = j * 3;
                const dx = positions[i3] - positions[j3];
                const dy = positions[i3 + 1] - positions[j3 + 1];
                const dz = positions[i3 + 2] - positions[j3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < config.connectionDistance) {
                    linePositions.push(
                        positions[i3], positions[i3 + 1], positions[i3 + 2],
                        positions[j3], positions[j3 + 1], positions[j3 + 2]
                    );
                }
            }
        }

        linesGeometry.dispose();
        linesGeometry = new THREE.BufferGeometry();
        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        linesMesh.geometry = linesGeometry;
    }

    // Animação
    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        const positions = particlesGeometry.attributes.position.array;

        // Atualizar posições
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velArray[i];
            positions[i + 1] += velArray[i + 1];
            positions[i + 2] += velArray[i + 2];

            // Limites da tela
            const halfWidth = window.innerWidth / 2;
            const halfHeight = window.innerHeight / 2;

            if (positions[i] < -halfWidth || positions[i] > halfWidth) {
                velArray[i] *= -1;
            }
            if (positions[i + 1] < -halfHeight || positions[i + 1] > halfHeight) {
                velArray[i + 1] *= -1;
            }
            if (positions[i + 2] < -250 || positions[i + 2] > 250) {
                velArray[i + 2] *= -1;
            }

            // Interação com mouse (sutil)
            if (config.mouseInteraction) {
                const dx = positions[i] - targetMouse.x;
                const dy = positions[i + 1] - targetMouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseDistance) {
                    const force = (config.mouseDistance - distance) / config.mouseDistance;
                    positions[i] += dx * force * 0.01;
                    positions[i + 1] += dy * force * 0.01;
                }
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        // Atualizar conexões (a cada 3 frames para performance)
        if (Math.random() < 0.33) {
            updateConnections();
        }

        // Rotação suave da cena
        particlesMesh.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }, 250);
    });

    // Cleanup quando sair da página (boa prática)
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
    });

    // Pausar quando não visível (economia de bateria)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
})();

function toggleMenu() {
            const navLinks = document.getElementById('nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            const isActive = navLinks.classList.toggle('active');
            
            menuToggle.setAttribute('aria-expanded', isActive);
            menuToggle.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu');
            
            // Bloqueia scroll do body quando menu está aberto
            document.body.style.overflow = isActive ? 'hidden' : '';
        }

        function closeMenu() {
            const navLinks = document.getElementById('nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu');
                document.body.style.overflow = '';
            }
        }

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            const navLinks = document.getElementById('nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Fechar menu com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // =========================================
        // Troca de Idioma com Persistência
        // =========================================
        function toggleLanguage() {
            const body = document.body;
            const html = document.documentElement;
            
            if (body.classList.contains('pt-active')) {
                body.classList.replace('pt-active', 'en-active');
                html.lang = 'en';
                localStorage.setItem('language', 'en');
            } else {
                body.classList.replace('en-active', 'pt-active');
                html.lang = 'pt-BR';
                localStorage.setItem('language', 'pt-BR');
            }
            
            closeMenu();
        }

        // Carregar idioma salvo
        (function() {
            const savedLang = localStorage.getItem('language');
            if (savedLang) {
                const body = document.body;
                const html = document.documentElement;
                
                body.classList.remove('pt-active', 'en-active');
                body.classList.add(savedLang === 'en' ? 'en-active' : 'pt-active');
                html.lang = savedLang;
            }
        })();

        // =========================================
        // Navegação com Efeito de Scroll
        // =========================================
        const nav = document.querySelector('nav');
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            // Efeito na navbar
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            // Botão voltar ao topo
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // =========================================
        // Animações de Scroll (Intersection Observer)
        // =========================================
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // =========================================
        // Formulário com Validação e Feedback
        // =========================================
        const form = document.getElementById("contact-form");
        const statusMsg = document.getElementById("form-status");
        const submitBtn = document.getElementById("submit-btn");

        // Validação em tempo real
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
            });
        });

        function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        return true;  
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
        return false;  
    }
}

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Verificar honeypot
            const honeypot = form.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                return; // Spam detectado
            }

            // Validar todos os campos
            let isValid = true;
            form.querySelectorAll('input[required], textarea[required]').forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                showStatus('Por favor, preencha todos os campos corretamente. / Please fill in all fields correctly.', 'error');
                return;
            }

            const originalBtnContent = submitBtn.innerHTML;
            const lang = document.body.classList.contains('pt-active') ? 'pt' : 'en';
            
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${lang === 'pt' ? 'Enviando...' : 'Sending...'}`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showStatus(
                        lang === 'pt' 
                            ? '✓ Mensagem enviada com sucesso! Entrarei em contato em breve.' 
                            : '✓ Message sent successfully! I will contact you soon.',
                        'success'
                    );
                    form.reset();
                    form.querySelectorAll('.valid, .invalid').forEach(field => {
                        field.classList.remove('valid', 'invalid');
                    });
                } else {
                    throw new Error('Erro no envio');
                }
            } catch (error) {
                showStatus(
                    lang === 'pt'
                        ? '✗ Oops! Ocorreu um problema ao enviar. Tente novamente ou entre em contato por WhatsApp.'
                        : '✗ Oops! There was a problem sending. Try again or contact via WhatsApp.',
                    'error'
                );
            } finally {
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });

        function showStatus(message, type) {
            statusMsg.textContent = message;
            statusMsg.className = type;
            statusMsg.style.display = 'block';
            
            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 6000);
        }

        // =========================================
        // Smooth Scroll para Links Internos
        // =========================================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // =========================================
        // Console Message
        // =========================================
        console.log('%c🚀 Pedro Henrique de Almeida', 'font-size: 24px; font-weight: bold; color: #2563eb;');
        console.log('%cFull Stack Python Developer', 'font-size: 14px; color: #64748b;');
        console.log('%c"Building software to solve real-world operational problems."', 'font-size: 12px; font-style: italic; color: #94a3b8;');