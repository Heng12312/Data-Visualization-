// Function to handle company_location data
export const company_location = (data) => {
    // Group data by company_location and calculate mean salary
    const nestedData = d3.group(data, d => d.company_location);

    const meanSalaries = Array.from(nestedData, ([key, value]) => {
        return {
            company_location: key,
            mean_salary: d3.mean(value, d => d.salary_in_usd)
        };
    });

    // Sort by mean_salary descending and select top 10
    meanSalaries.sort((a, b) => b.mean_salary - a.mean_salary);
    const topLocations = meanSalaries.slice(0, 10);

    // Call function to clear previous treemap
    clearTreemap();

    // Call function to create treemap with topLocations data
    createTreemap(topLocations);
};

// Country code to country name mapping
const countryCodeMapping = {
    'QA': 'Qatar',
    'PR': 'Puerto Rico',
    'UA': 'Ukraine',
    'SA': 'Saudi Arabia',
    'AU': 'Australia',
    'IL': 'Israel',
    'US': 'United States',
    'CA': 'Canada',
    'NZ': 'New Zealand',
    'BA': 'Bosnia and Herzegovina'
};

// Function to create treemap visualization
function createTreemap(data) {
    // Clear previous content in treemap-container
    d3.select("#treemap-container").html("");

    // Set up dimensions and margins for the SVG
    const margin = { top: 130, right: 20, bottom: 20, left: 20 };
    const width = 950 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create hierarchical data structure for treemap layout
    const root = d3.hierarchy({ children: data })
        .sum(d => d.mean_salary)
        .sort((a, b) => b.mean_salary - a.mean_salary);

    // Define treemap layout
    const treemap = d3.treemap()
        .size([width, height])
        .padding(1)
        .round(true);

    // Generate treemap nodes
    treemap(root);

    // Append SVG with margin
    const svg = d3.select("#treemap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "5px");

    // Create rectangles for each node
    const nodes = svg.selectAll("rect")
        .data(root.leaves())
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            tooltip.html(`<b>Company Location:</b> ${countryCodeMapping[d.data.company_location] || d.data.company_location}<br><b>Mean Salary:</b> $${d.data.mean_salary.toFixed(2)}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add text labels
// Add text labels with wrapping
svg.selectAll("text")
    .data(root.leaves())
    .enter().append("text")
    .attr("x", d => d.x0 + 5)
    .attr("y", d => d.y0 + 20) // Position text below the rectangle
    .attr("font-size", "15px")
    .attr("fill", "white")
    .each(function(d) {
        const text = d3.select(this);
        const words = (countryCodeMapping[d.data.company_location] || d.data.company_location).split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = parseFloat(text.attr("y"));
        const dy = parseFloat(text.attr("dy"));

        let tspan = text.text(null).append("tspan")
            .attr("x", d => d.x0 + 5)
            .attr("y", y)
            .attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > (d.x1 - d.x0)) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", d => d.x0 + 5)
                    .attr("y", y + 15)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });




    // Add mean salary values below country names
    svg.selectAll(".salary-text")
        .data(root.leaves())
        .enter().append("text")
        .attr("class", "salary-text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 55) // Adjust the vertical position as needed
        .text(d => `$${d.data.mean_salary.toFixed(2)}`)
        .attr("font-size", "15px")
        .attr("fill", "white")
        .attr("text-anchor", "start"); // Align text to start from x position

}



// Function to clear previous treemap
function clearTreemap() {
    // Clear previous content in treemap-container
    d3.select("#treemap-container").html("");
    const svg = d3.select('svg');
    svg.selectAll('.chart-group').remove(); // Remove the entire chart group
    svg.selectAll('.chart-title').remove(); // Remove title
    svg.selectAll('.x-axis-label').remove(); // Remove x-axis label
    svg.selectAll('.y-axis-label').remove(); // Remove y-axis label
}
