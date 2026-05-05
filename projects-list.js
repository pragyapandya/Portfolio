// Global state variables
let originalProjects = [];
let uniqueSkills = [];
let selectedSkillFilters = new Set();
let currentSort = 'recent';

// CRITICAL FIX 1: Wait for the HTML to fully load before doing anything
document.addEventListener('DOMContentLoaded', () => {
    
    const projectsContainer = document.getElementById('projects-container');
    const skillFilterContainer = document.getElementById('skill-filter-tags');
    const sortSelect = document.getElementById('sort-select');

    // CRITICAL FIX 2: Abort the script silently if we aren't on the Projects page. 
    // This prevents fatal errors from breaking JS on your other pages.
    if (!projectsContainer) return;

    async function initProjectsList() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) throw new Error("JSON file not found.");
            originalProjects = await response.json();

            // Only generate filter UI if the container actually exists in the HTML
            if (skillFilterContainer) {
                extractUniqueSkills();
                generateSkillFilterUI();
            }
            
            applyFiltersAndSort();

            if (sortSelect) {
                sortSelect.addEventListener('change', (event) => {
                    currentSort = event.target.value;
                    applyFiltersAndSort();
                });
            }

        } catch (error) {
            console.error('Error loading projects list:', error);
            projectsContainer.innerHTML = '<div style="text-align: center; color: var(--tan-brown); padding: 2rem;">Error loading project data. Check your JSON file.</div>';
        }
    }

    function extractUniqueSkills() {
        const skillCounts = {};
        
        originalProjects.forEach(project => {
            // Failsafe: Ensure skillsUsed exists and is an array before looping
            if (project.skillsUsed && Array.isArray(project.skillsUsed)) {
                project.skillsUsed.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });

        const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);
        uniqueSkills = sortedSkills.slice(0, 6).map(item => item[0]);
    }

    function generateSkillFilterUI() {
        skillFilterContainer.innerHTML = ''; 

        uniqueSkills.forEach(skill => {
            const skillPill = document.createElement('button');
            skillPill.className = 'skill-filter-pill unselected'; 
            skillPill.dataset.skill = skill;

            skillPill.innerHTML = `
                ${skill}
                <span class="icon unselected-icon">&plus;</span>
                <span class="icon selected-icon" style="display:none;">&check;</span>
            `;

            skillPill.addEventListener('click', () => toggleSkillFilter(skill, skillPill));
            skillFilterContainer.appendChild(skillPill);
        });
    }

    function toggleSkillFilter(skill, pillElement) {
        const unselectedIcon = pillElement.querySelector('.unselected-icon');
        const selectedIcon = pillElement.querySelector('.selected-icon');

        if (selectedSkillFilters.has(skill)) {
            selectedSkillFilters.delete(skill);
            pillElement.classList.remove('selected');
            pillElement.classList.add('unselected');
            if (unselectedIcon) unselectedIcon.style.display = 'inline';
            if (selectedIcon) selectedIcon.style.display = 'none';
        } else {
            selectedSkillFilters.add(skill);
            pillElement.classList.remove('unselected');
            pillElement.classList.add('selected');
            if (unselectedIcon) unselectedIcon.style.display = 'none';
            if (selectedIcon) selectedIcon.style.display = 'inline';
        }
        applyFiltersAndSort();
    }

function generateProjectCard(project) {
        // Failsafe for missing skills array
        const skillsArray = project.skillsUsed || [];
        const skillTagsHtml = skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        
        // Failsafe for missing dates
        let formattedDate = "Ongoing";
        if (project.date) {
            formattedDate = new Date(project.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        const imageHtml = project.imagePath 
            ? `<img src="${project.imagePath}" alt="${project.title}">` 
            : ''; 

        return `
            <div class="project-card fade-in">
                <div class="project-img-placeholder">
                    ${imageHtml}
                </div>
                <div>
                    <h2 style="color: var(--dark-teal); margin-bottom: 0.5rem;">${project.title || 'Untitled Project'}</h2>
                    <div style="display: flex; gap: 1rem; color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; font-weight: bold;">
                        <span>${formattedDate}</span>
                        <span>|</span>
                        <span>${project.category || 'Portfolio'}</span>
                    </div>
                    <div class="tag-container" style="margin-bottom: 1.5rem;">
                        ${skillTagsHtml}
                    </div>
                    <p style="margin-bottom: 2rem; color: #444; line-height: 1.5;">${project.shortDescription || 'No description available.'}</p>
                    <a href="project-detail.html?id=${project.id}" class="btn" style="display: inline-block;">View Case Study &rarr;</a>
                </div>
            </div>
        `;
    }

    function applyFiltersAndSort() {
        projectsContainer.innerHTML = ''; 

        // 1. FILTERING
        let filteredProjects = originalProjects.filter(project => {
            if (selectedSkillFilters.size === 0) return true; 
            
            const skillsArray = project.skillsUsed || [];
            return skillsArray.some(skill => selectedSkillFilters.has(skill));
        });

        filteredProjects.sort((a, b) => {
            const titleA = (a.title || "").toLowerCase();
            const titleB = (b.title || "").toLowerCase();
            
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;

            switch (currentSort) {
                case 'recent':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'az':
                    return titleA.localeCompare(titleB);
                case 'za':
                    return titleB.localeCompare(titleA);
                default:
                    return dateB - dateA; 
            }
        });

        // 3. RENDER
        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = '<div style="text-align: center; color: var(--tan-brown); font-weight: bold; font-size: 1.2rem; padding: 3rem;">No projects match the selected skills.</div>';
        } else {
            const cardsHtml = filteredProjects.map(project => generateProjectCard(project)).join('');
            projectsContainer.innerHTML = cardsHtml;
        }
    }

    // Kick it off only after verifying the DOM is ready
    initProjectsList();
});