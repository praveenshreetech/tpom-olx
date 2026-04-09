document.addEventListener('DOMContentLoaded', () => {
    const imagesInput = document.getElementById('images-input');
    const previewsContainer = document.getElementById('image-previews');
    const uploadText = document.getElementById('upload-text');
    const imgCount = document.getElementById('img-count');

    if (imagesInput) {
        let filesList = [];

        imagesInput.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            filesList = [...filesList, ...newFiles].slice(0, 5);
            updatePreviews();
            updateInputFiles();
        });

        function updatePreviews() {
            previewsContainer.innerHTML = '';
            
            if (filesList.length > 0) {
                previewsContainer.style.display = 'flex';
                uploadText.textContent = filesList.length >= 5 ? 'Maximum 5 images reached' : `Add more photos (${5 - filesList.length} remaining)`;
                imgCount.textContent = `${filesList.length}/5 selected`;
            } else {
                previewsContainer.style.display = 'none';
                uploadText.textContent = `Click to upload photos`;
                imgCount.textContent = `0/5 selected`;
            }

            filesList.forEach((file, i) => {
                const src = URL.createObjectURL(file);
                
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'preview-thumb';
                thumbDiv.style.position = 'relative';
                thumbDiv.style.width = '80px';
                thumbDiv.style.height = '80px';

                const img = document.createElement('img');
                img.src = src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                thumbDiv.appendChild(img);

                if (i === 0) {
                    const badge = document.createElement('span');
                    badge.className = 'main-badge';
                    badge.textContent = 'Main';
                    badge.style.position = 'absolute';
                    badge.style.bottom = '4px';
                    badge.style.left = '4px';
                    badge.style.fontSize = '0.65rem';
                    badge.style.padding = '2px 6px';
                    badge.style.background = 'var(--primary, #0088ff)';
                    badge.style.color = '#fff';
                    badge.style.borderRadius = '4px';
                    thumbDiv.appendChild(badge);
                } else {
                    const mainBtn = document.createElement('button');
                    mainBtn.type = 'button';
                    mainBtn.textContent = 'Set Main';
                    mainBtn.style.position = 'absolute';
                    mainBtn.style.bottom = '4px';
                    mainBtn.style.left = '4px';
                    mainBtn.style.fontSize = '0.65rem';
                    mainBtn.style.padding = '2px 6px';
                    mainBtn.style.background = 'rgba(0,0,0,0.55)';
                    mainBtn.style.color = '#fff';
                    mainBtn.style.border = 'none';
                    mainBtn.style.borderRadius = '4px';
                    mainBtn.style.cursor = 'pointer';
                    mainBtn.onclick = (e) => {
                        e.preventDefault();
                        const [f] = filesList.splice(i, 1);
                        filesList.unshift(f);
                        updatePreviews();
                        updateInputFiles();
                    };
                    thumbDiv.appendChild(mainBtn);
                }

                const rmBtn = document.createElement('button');
                rmBtn.type = 'button';
                rmBtn.textContent = '✕';
                rmBtn.style.position = 'absolute';
                rmBtn.style.top = '4px';
                rmBtn.style.right = '4px';
                rmBtn.style.width = '20px';
                rmBtn.style.height = '20px';
                rmBtn.style.lineHeight = '18px';
                rmBtn.style.textAlign = 'center';
                rmBtn.style.background = 'rgba(0,0,0,0.55)';
                rmBtn.style.color = '#fff';
                rmBtn.style.border = 'none';
                rmBtn.style.borderRadius = '50%';
                rmBtn.style.cursor = 'pointer';
                rmBtn.style.fontSize = '0.75rem';
                rmBtn.onclick = (e) => {
                    e.preventDefault();
                    filesList.splice(i, 1);
                    updatePreviews();
                    updateInputFiles();
                };
                thumbDiv.appendChild(rmBtn);

                previewsContainer.appendChild(thumbDiv);
            });
        }

        function updateInputFiles() {
            const dt = new DataTransfer();
            filesList.forEach(f => dt.items.add(f));
            imagesInput.files = dt.files;
        }
    }
});
