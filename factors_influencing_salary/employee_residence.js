// Function to handle employee_residence data
export const employee_residence = (data) => {
    // Group data by employee_residence and calculate mean salary
    const nestedData = d3.group(data, d => d.employee_residence);

    // Calculate mean salaries and sort by descending order
    const meanSalaries = Array.from(nestedData, ([key, value]) => {
        return {
            employee_residence: key,
            mean_salary: d3.mean(value, d => d.salary_in_usd)
        };
    }).sort((a, b) => b.mean_salary - a.mean_salary).slice(0, 10); // Select top 10 mean salaries

    // Call function to clear circular bar chart
    clearBarChart();
    // Call function to create circular bar chart
    createCircularBarChart(meanSalaries);
};

// Country code to country name mapping
const countryCodeMapping = {
    'IL': 'Israel',
    'QA': 'Qatar',
    'MY': 'Malaysia',
    'PR': 'Puerto Rico',
    'US': 'United States',
    'CA': 'Canada',
    'AU': 'Australia',
    'UA': 'Ukraine',
    'SA': 'Saudi Arabia',
    'CN': 'China'
};

// Function to create circular bar chart visualization
function createCircularBarChart(data) {
    // Clear previous content in treemap-container
    d3.select("#treemap-container").html("");

    // Set the dimensions and margins of the graph
    var margin = { top: 150, right: 10, bottom: 100, left: 10 },
        width = 575 - margin.left - margin.right,
        height = 575 - margin.top - margin.bottom,
        innerRadius = 25,
        outerRadius = Math.min(width, height) / 2 - 50; // Adjusted outerRadius

    // Append the SVG object
    var svg = d3.select("#treemap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

    // Scales
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(data.map(function(d) { return d.employee_residence; })); // The domain of the X axis is the list of employee residences.

    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be defined later.
        .domain([0, d3.max(data, function(d) { return d.mean_salary; })]); // Domain of Y is from 0 to the max mean salary seen in the data

    // Tooltip setup
    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "5px");
    }

    // Add the bars
    svg.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.arc() // imagine you're doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(d => y(d.mean_salary))
            .startAngle(d => x(d.employee_residence))
            .endAngle(d => x(d.employee_residence) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius))
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<b>Employee Residence:</b> ${countryCodeMapping[d.employee_residence] || d.employee_residence}<br><b>Mean Salary:</b> $${d.mean_salary.toFixed(2)}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        });

    // Add the labels for country names
    svg.selectAll(".country-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "country-label")
        .text(d => countryCodeMapping[d.employee_residence] || d.employee_residence)
        .attr("transform", function(d) {
            return "rotate(" + ((x(d.employee_residence) + x.bandwidth() / 2) * 180 / Math.PI - 90) +
                ")" +
                "translate(" + (y(d.mean_salary) + 20) + ",0)" + // Adjusted to provide space for salary
                ((x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)");
        })
        .attr("text-anchor", function(d) {
            return (x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
        })
        .style("font-size", "16px")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white");

    // Add the labels for mean salaries under country names
    svg.selectAll(".salary-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "salary-label")
        .text(d => `$${d.mean_salary.toFixed(2)}`)
        .attr("transform", function(d) {
            return "rotate(" + ((x(d.employee_residence) + x.bandwidth() / 2) * 180 / Math.PI - 90) +
                ")" +
                "translate(" + (y(d.mean_salary) + 23) + ",15)" + // Adjusted vertical position for mean salary
                ((x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)");
        })
        .attr("text-anchor", function(d) {
            return (x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
        })
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white");

}

function clearBarChart() {
    // Clear previous bar chart
    const svg = d3.select('svg');
    svg.selectAll('.chart-group').remove(); // Remove the entire chart group
    svg.selectAll('.chart-title').remove(); // Remove title
    svg.selectAll('.x-axis-label').remove(); // Remove x-axis label
    svg.selectAll('.y-axis-label').remove(); // Remove y-axis label
}
