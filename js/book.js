document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-reader-btn');
    const closeBtn = document.getElementById('close-reader-btn');
    const modal = document.getElementById('reader-modal');
    const epubLink = document.getElementById('epub-download-link');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    let rendition = null;
    let book = null;

    if (!openBtn || !modal || !epubLink) return;

    const epubUrl = epubLink.getAttribute('href');

    // Open Modal & Load Book
    openBtn.addEventListener('click', () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Блокируем скролл основной страницы

        if (!rendition) {
            // Инициализация ePub.js
            book = ePub(epubUrl);
            rendition = book.renderTo('epub-viewer', {
                width: '100%',
                height: '100%',
                spread: 'always'
            });

            rendition.display();

            // Управление стрелками с клавиатуры
            document.addEventListener('keydown', handleKeyPress);
        }
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);

    // Pagination Controls
    prevBtn.addEventListener('click', () => rendition?.prev());
    nextBtn.addEventListener('click', () => rendition?.next());

    function handleKeyPress(e) {
        if (!modal.classList.contains('is-open')) return;

        if (e.key === 'ArrowRight') rendition?.next();
        if (e.key === 'ArrowLeft') rendition?.prev();
        if (e.key === 'Escape') closeModal();
    }
});