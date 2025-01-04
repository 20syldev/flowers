onload = () => {
    const items = Array.from(document.querySelectorAll('.item')).reverse();
    items.forEach(item => item.classList.remove('show'));
    setTimeout(() => {
        document.body.classList.remove('not-loaded');
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add('show'), index * 300);
        });
    }, 1000);
};

toggleModal = () => {
    const modal = document.querySelector('.modal');
    modal.classList.toggle('visible');
    modal.classList.toggle('hidden');
}

redirect = (event) => {
    const input = document.getElementById('input').value.trim();
    if (input && (event.key === "Enter" || event.type === "click")) {
        window.location.href = `/app?api=${encodeURIComponent(input)}`;
    }
};