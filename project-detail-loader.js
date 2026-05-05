// Function to load details for a single project based on ID
async function initProjectDetail() {
    try {
        // 1. Get the ID from the URL parameter (...project-detail.html?id=1)
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) throw new Error("No project ID specified in URL.");

        // 2. Fetch the JSON data
        const response = await fetch('projects.json');
        if (!response.ok) throw new Error("JSON file not found.");
        const projects = await response.json();

        // 3. Find the matching project (convert ID to number)
        const project = projects.find(p => p.id === parseInt(projectId));

        if (!project) {
            // Show error if project ID not found
            document.querySelector('main').innerHTML = '<div class="block-section bg-white"><div class="inner-card" style="text-align: center; max-width: 600px;"><h1>Project Not Found</h1><p style="margin-bottom: 2rem;">The project ID you are looking for does not exist.</p><a href="projects.html" class="btn">&larr; Back to Projects</a></div></div>';
            return;
        }

        // 4. Populate DOM with project data

        const detailImage = document.getElementById('project-detail-image');
        if (project.imagePath && detailImage) {
            detailImage.style.backgroundImage = `url('${project.imagePath}')`;
        }

        document.getElementById('project-detail-title').textContent = project.title;
        document.getElementById('project-detail-category').textContent = project.category;
        document.getElementById('project-detail-affiliation').textContent = project.affiliation;
        
        // Reformat date for detail view
        document.getElementById('project-detail-date').textContent = new Date(project.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        document.getElementById('project-detail-goals').textContent = project.goals;
        document.getElementById('project-detail-short-description').textContent = project.shortDescription;

        // Check if the description is an array
        if (Array.isArray(project.description)) {
            // Map through the array, wrap in <p> tags, and use .join('') to remove the commas!
            const formattedDesc = project.description.map(paragraph => 
                `<p style="margin-bottom: 1rem;">${paragraph}</p>`
            ).join('');
            
            document.getElementById('project-detail-description').innerHTML = formattedDesc;
        } else {
            // Fallback just in case some of your older projects are still single strings
            document.getElementById('project-detail-description').innerHTML = project.description;
        }

        // POPULATE EXTERNAL LINKS
        const linksContainer = document.getElementById('project-links-container');
        // Check if the array exists and has items
        if (project.externalLinks && project.externalLinks.length > 0) {
            const linksHtml = project.externalLinks.map(link => 
                `<a href="${link.url}" target="_blank" class="btn" style="background-color: var(--dark-teal); color: white;">
                ${link.label} &nearr;
                </a>`
            ).join('');
            linksContainer.innerHTML = linksHtml;
        }
    // POPULATE IMAGE GALLERY
        const galleryContainer = document.getElementById('project-gallery-container');
        if (project.galleryImages && project.galleryImages.length > 0) {
            const galleryHtml = project.galleryImages.map(imgSrc => 
                `<img src="${imgSrc}" alt="Gallery Image for ${project.title}" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">`
            ).join('');
            
            // Add a title above the gallery
            galleryContainer.innerHTML = galleryHtml;
        }

        // Build skill tags list (mapped to light blue)
        const skillsContainer = document.getElementById('project-detail-skills');
        project.skillsUsed.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });


    } catch (error) {
        console.error('Error loading project details:', error);
        // Generic error message if something fails
        document.querySelector('main').innerHTML = '<div class="block-section bg-white"><div class="inner-card" style="text-align: center; max-width: 600px;"><h1>Error Loading Project</h1><p style="margin-bottom: 2rem;">There was an issue loading the project details. Please try again later.</p><a href="projects.html" class="btn">&larr; Back to Projects</a></div></div>';
    }
}

// Initialize on load
initProjectDetail();