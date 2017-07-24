//import * as d3 from 'd3';
import {
	selectAll,
	select,
	selection,
	html} from 'd3-selection';
import {timeParse} from 'd3-time-format';
import {scaleLinear,scaleBand,scaleOrdinal} from 'd3-scale';
import {range,extent,max} from 'd3-array';
import {axisBottom,axisLeft,axis} from 'd3-axis';
import {transition} from 'd3-transition';
import {format} from 'd3-format';
require('./index.css');

const url='https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
getData(url)

function getData(url){
	fetch(url)
	.then(response=>response.json())
	.then(data=>{
		console.log(data)
		drawGraph(data)
	})
}
function drawGraph(data){
	//variable holding svg attributes
	const margin ={top:50,bottom:100,left:50,right:50}
	const width = 950;
	const height = 450;
	const innerHeight = height - margin.top - margin.bottom;
	const innerWidth = width - margin.left - margin.right;
	const secondHeight = innerHeight -margin.bottom;

	//creates svg
	let svg = select('body')
		.append('svg')
		.attr('width',width)
		.attr('height',height)
		.attr('class','graph')
		.append('g').attr('transform','translate('
			+ margin.left + ',' + margin.top + ')');

	//set grid width and height
	const last = data.monthlyVariance.length -1;
	const years = data.monthlyVariance[last].year - data.monthlyVariance[0].year;
	const gridWidth = innerWidth/years
	const gridHeight = innerHeight/(12-1)

	//set ranges
	let xScale = scaleLinear()
		.range([0,innerWidth]);

	let yScale = scaleLinear()
		.range([innerHeight-gridHeight,0]);
	
	//set domain
	xScale.domain(extent(data.monthlyVariance,d=>{return d.year}))
	
	const yDomain = extent(data.monthlyVariance,d=>{return d.month})
	yScale.domain(swap(yDomain))

	console.log(xScale.domain(),yScale.domain()) 

	const color = ['purple','blue','green','teal','#ffff4c','#ffffcc',
					'#ffd27f','#ffae19','#ff4c4c','#ff0000','#990000']
	const month =["January","February","March","April","May",
						"June","July","August","September","October",
						"November","December"]
	console.log(gridWidth,gridHeight)
	
	//shows data on mousehover
	let div = select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0);

	svg.selectAll('.correlation')
		.data(data.monthlyVariance)
		.enter().append('rect')
			.attr('class','correlation')
			.attr('x',function(d){return xScale(d.year)})
			.attr('y',function(d){return yScale(d.month)})
			.attr("width", gridWidth)
			.attr("height", gridHeight)
			.on("mouseover",function(d){
				div.transition()
					.duration(200)
					.style("opacity",.9)
				div.html(d.year + " " + month[d.month-1] +" "+ d.variance)
					.style("left",(event.pageX -70)+"px")
					.style("top",(event.pageY-70)+"px")
				
			})
			.on("mouseout",function(d){
				div.transition()
					.duration(500)
					.style("opacity",0)
			})

	//add x and y axis
	svg.append('g')
		.attr('class','x-axis')
		.attr('transform','translate(0,'+ innerHeight +')')
		.call(axisBottom(xScale));
	
	svg.append('g')
		.attr('class','y-axis')
		.call(axisLeft(yScale));

}
function swap(x){
	let temp = x[0];
	x[0] = x[1];
	x[1] = temp;
	return x
}