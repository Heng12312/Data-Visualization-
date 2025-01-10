// company_size.js

export const company_size = (data) => {
    // Group data by company_size and calculate mean salary
    const nestedData = d3.group(data, d => {
        // Map company_size L, M, S to Large, Medium, Small
        switch (d.company_size) {
            case 'L':
                return 'Large';
            case 'M':
                return 'Medium';
            case 'S':
                return 'Small';
            default:
                return d.company_size;
        }
    });

    const meanSalaries = Array.from(nestedData, ([key, value]) => {
        return {
            company_size: key,
            mean_salary: d3.mean(value, d => d.salary_in_usd)
        };
    });

    // Call function to clear bar chart
    clearBarChart();
    // Call function to create bar chart
    createBarChart(meanSalaries);
};

// createBarChart function

function createBarChart(data) {
    d3.select("#treemap-container").html("");
    const svg = d3.select('svg'); // Select the SVG element or create a new one

    const margin = { top: 150, right: 100, bottom: 50, left: 80 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(data.map(d => d.company_size))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.mean_salary)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Append or select the group for chart content
    let chartGroup = svg.select('g.chart-group');
    if (chartGroup.empty()) {
        chartGroup = svg.append('g')
            .attr('class', 'chart-group')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    }

    // Clear previous bars
    chartGroup.selectAll('.bar').remove();

    // Draw bars
    const bars = chartGroup.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.company_size))
        .attr('y', d => y(d.mean_salary))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.mean_salary))
        .attr('fill', '#69b3a2');

    // Add text labels for mean salary on top of each bar
    chartGroup.selectAll('.bar-label')
        .data(data)
        .enter().append('text')
        .attr('class', 'bar-label')
        .text(d => `$${d.mean_salary.toFixed(2)}`) // Format mean salary to 2 decimal places
        .attr('x', d => x(d.company_size) + x.bandwidth() / 2)
        .attr('y', d => y(d.mean_salary) - 10) // Adjusted position to be above the bar
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .attr('fill', 'white');

    // X-axis
    chartGroup.select('.x-axis').remove(); // Remove previous axis to avoid duplication
    chartGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0)) // Remove ticks with tickSize(0)
        .selectAll('text')
        .style('text-anchor', 'end')
     

    // Title (if not already present)
    svg.select('.chart-title').remove(); // Remove previous title if exists
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .text('Mean Salary by Company Size');



    // Add tooltip interaction
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

    bars.on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            tooltip.html(`<b style="color: white;">Company Size:</b> <b style="color: white;">${d.company_size}</b>
                <br><b style="color: white;">Mean Salary:</b> <b style="color: white;">$${d.mean_salary.toFixed(2)}</b>`);
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
}

function clearBarChart() {
    // Clear previous bar chart
    const svg = d3.select('svg');
    svg.selectAll('.chart-group').remove(); // Remove the entire chart group
    svg.selectAll('.chart-title').remove(); // Remove title
    svg.selectAll('.x-axis-label').remove(); // Remove x-axis label
    svg.selectAll('.y-axis-label').remove(); // Remove y-axis label
}
