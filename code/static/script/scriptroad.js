document.getElementById("roadmap-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById("topic").value.trim();
    if (!topic) {
        alert("Please enter a topic");
        return;
    }

    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("roadmap-content").innerHTML = "";
    document.getElementById("roadmap-box").style.width = "40%"; // Reset width

    try {
        const response = await fetch('/get_roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `topic=${encodeURIComponent(topic)}`
        });

        if (!response.ok) throw new Error("Server error");
        const text = await response.text();
        
        document.getElementById("roadmap-content").innerHTML = `<div class="styled-content">${text}</div>`;
        document.getElementById("roadmap-result").classList.add("shown");

        // Show the download button after the roadmap is generated
        document.getElementById("download-btn").style.display = 'inline-block';
    } catch (error) {
        document.getElementById("roadmap-content").innerHTML = 
            `<div class="error">❌ Error: ${error.message}</div>`;
    } finally {
        document.getElementById("loading").classList.add("hidden");
        document.getElementById("roadmap-box").style.width = "95%"; // Enlarge width
    }
});

// Download feature to download the roadmap as a PDF file
document.getElementById("download-btn").addEventListener("click", async () => {
    const content = document.getElementById("roadmap-content"); // Get content
    const { jsPDF } = window.jspdf; // Import jsPDF from the library

    // Use html2canvas to capture the content
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF(); // Create a jsPDF document
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add the image to the PDF
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Save the PDF
    doc.save(`roadmap-${document.getElementById("topic").value}.pdf`);
});

// Allow form submission with the Enter key
document.getElementById("topic").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        document.querySelector("button[type='submit']").click();
    }
});