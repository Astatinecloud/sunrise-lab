async function boot(): Promise<void> {
    const main = document.querySelector('main');
    try {
        await import('./main');
    }
    catch (error) {
        console.error('SUNRISE bootstrap failed', error);
        if (!main) {
            return;
        }
        main.innerHTML = `<h1>SUNRISE LAB</h1>
<p role="alert">読み込みに失敗しました。再試行してください。</p>
<button id="retry-load">再試行</button>`;
        main.querySelector<HTMLButtonElement>('#retry-load')!.onclick = () => location.reload();
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void boot(), {
        once: true
    });
}
else {
    void boot();
}
