"use strict";


/** Canvas
 * Code concerning canvas.
 */


// general variables/functions
const c = $("#art")[0];
const ctx = c.getContext("2d");


// loading pictures for later use
let img = new Image();
img.src = "../space_ship.png";

let black_flag = new Image();
black_flag.src = "../black_flag.png";

// Simple 1:1 Scenario
function get_mouse_pos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Phase 1, you see a box. What do you do with said box?
// first wall
const first_wall = new Path2D();
first_wall.moveTo(200, 100);
first_wall.lineTo(275, 125);
first_wall.lineTo(275, 200);
first_wall.lineTo(200, 175);
first_wall.lineTo(200, 100);

// second wall
const second_wall = new Path2D();
second_wall.moveTo(275, 125);
second_wall.lineTo(275, 200);
second_wall.lineTo(350, 175);
second_wall.lineTo(350, 100);
second_wall.lineTo(275, 125);


function draw_closed_box () {
    const top_part_closed = new Path2D();
    top_part_closed.moveTo(200, 100);
    top_part_closed.lineTo(275, 75);
    top_part_closed.lineTo(350, 100);
    top_part_closed.lineTo(275, 125);
    top_part_closed.lineTo(200, 100);
    // line of the top part.
    top_part_closed.moveTo(275 - 35, 112.5);
    top_part_closed.lineTo(310, 87.5);
    ctx.fillStyle = "#500";

    return top_part_closed;
}

function draw_open_box () {
    const top_part_open = new Path2D();
    top_part_open.moveTo(200, 100);
    top_part_open.lineTo(275, 75);
    top_part_open.lineTo(350, 100);
    top_part_open.lineTo(275, 125);
    top_part_open.lineTo(200, 100);
    ctx.fillStyle = "#FFAA00";

    return top_part_open;
}

// concerning mouse movement
function is_on_top_part (evt) {
    const min_x = 200;
    const max_x = 350;

    const min_y = 75;
    const max_y = 125;

    let pos = get_mouse_pos(c, evt);
    return (pos.x > min_x && pos.x < max_x) && (pos.y > min_y && pos.y < max_y);
}

// changes the top of the box so that it may be clicked.



// this starts the functionality of the art piece.
$("#art")
    .on('mousemove', open_box)
    .on('click', enter_next_stage);

function open_box (evt) {
    // had first_stage here
    if (is_on_top_part(evt)) {
        ctx.fill(draw_open_box());
        ctx.stroke(draw_open_box());
        c.style.cursor = 'zoom-in';
    } else {
        ctx.fill(draw_closed_box());
        ctx.stroke(draw_closed_box());
        c.style.cursor = 'default';
    }
}

function enter_next_stage (evt) {
    if (is_on_top_part(evt)) {
        // steps inside the box
        ctx.fillStyle = "#FFAA00";
        c.style.cursor = 'default';
        ctx.fillRect(0, 0, c.width, c.height);

        // turn off check for box.
        // turn on check for adding craters.
        // turn on check for mouse pos.
        $("#art")
            .off('mousemove', open_box)
            .off('click', enter_next_stage)
            .on('click', create_planet)
            .on('mousemove', points_at_planet);
        draw_mars();
    }
}

// Complete canvas.
ctx.fillStyle = "#600";
ctx.fill(first_wall);
ctx.fill(second_wall);
ctx.fill(draw_closed_box());

ctx.stroke(first_wall);
ctx.stroke(second_wall);
ctx.stroke(draw_closed_box());
ctx.save();


// Phase 2, this is for when the user opens and enters the box in the canvas.


// planet info:
let mars_opacity = 0.3;
let mars_x = 500;
let mars_y = 200;
let mars_radius = 100;


// Creates the planet and starts the create_planet functionality.
function draw_mars () {
    ctx.beginPath();
    ctx.fillStyle = "rgba(250, 0, 0, 1)";
    ctx.arc(mars_x, mars_y, mars_radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
}


// borrowed code, https://jsperf.com/no-square-root
// Checks so see if the mouse pointer is inside a circle.
function pointInCircle(cx, cy, radius, evt) {
    let pos = get_mouse_pos(c, evt);
    let x = pos.x; let y = pos.y;
    let distsq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distsq <= radius * radius
}

// max amount of craters: 3
let crater_count = 0;
function create_planet(evt) {
    if (crater_count < 3) {
        // planet is complete. Start third and final phase!
        if (points_at_planet(evt)) {
            add_crater(evt);
        }
        if (crater_count === 3) {
            // next move. Final part.

            // Spaceship goes outside the screen at first.
            ctx.drawImage(img, -120, 100);
            $("#art")
                .off('click', create_planet)
                .off('mousemove', points_at_planet)
                .on('click', start_space_ship)
                .on('mousemove', point_at_space_ship);
            c.style.cursor = 'default';
        }
    }
}

function points_at_planet(evt) {
    if (pointInCircle(mars_x, mars_y, mars_radius, evt)) {
        c.style.cursor = 'pointer';
        return true;
    } else {
        c.style.cursor = 'default';
    }
    return false;
}

let crater_objects = [];

// Adds a crater to both the canvas and to the
function add_crater(evt) {
    if (is_crater_valid(evt)) {
        let pos  = get_mouse_pos(c, evt);
        let x = pos.x; let y = pos.y;
        let size = Math.floor(Math.random() * 15) + 15;
        ctx.fillStyle = "rgb(128, 0, 0)";
        ctx.arc(x, y, size, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        crater_count++;

        crater_objects.push({
            x: x,
            y: y,
            size: size
        });
    }
}

// Checks to see if the placement of a crater is valid.
// One can not place a crater on top of another crater.
function is_crater_valid(evt) {
    for (let i = 0; i < crater_objects.length; i++) {
        let cra = crater_objects[i];
        let x = cra.x; let y = cra.y;
        let radius = cra.size;
        if (pointInCircle(x, y, radius, evt)) {
            return false;
        }
    }
    return true;
}

// Spaceship code
function start_space_ship(evt) {
    if (is_on_top_space_ship(evt)) {
        move_spaceship(evt);
        $("#art")
            .off('click', start_space_ship)
            .off('mousemove', point_at_space_ship);
        c.style.cursor = 'default';
    }
}

let distance_space_ship = 0;
let space_ship_width = 100;
let space_ship_height = 50;


// This is part of the animation for moving the space ship from A to B.
// Uses the popular way of doing animations in canvas:
//  * clears the whole canvas,
//  * moves the object a tiny bit, and
//  * places everything back to their normal state.
// This uses the function requestAnimationFrame to make the movement look smooth.
function move_spaceship() {
    if (distance_space_ship < 480 ) {
        clear_canvas();

        ctx.beginPath();
        ctx.fillStyle = "#FFAA00";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.closePath();
        ctx.beginPath();

        ctx.drawImage(img, distance_space_ship+= 2, 100, space_ship_width -= 0.4, space_ship_height -= 0.2);

        ctx.closePath();
        draw_mars();
        draw_craters();

        window.requestAnimationFrame(move_spaceship);
    }else {
        draw_box_on_planet();
        $("#art")
            .on('click', start_flag)
            .on('mousemove', point_at_box_on_planet)
        ;
    }
}

// Draws craters already made.
// These craters have been made earlier when the user placed the on the red circle.
// Used for animating with requestAnimationFrame
function draw_craters() {
    for (let i = 0; i < crater_objects.length ; i++) {
        let crater = crater_objects[i];
        let x = crater.x;
        let y = crater.y;
        let size = crater.size;
        ctx.beginPath();
        ctx.fillStyle = "rgb(128, 0, 0)";
        ctx.arc(x,  y, size, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

// Clears the canvas.
function clear_canvas() {
    ctx.clearRect(0,0, c.width, c.height);
}

// Changes the cursor based on if one is
// pointing at the space ship while it is stationary or not.
function point_at_space_ship(evt) {
    if (is_on_top_space_ship(evt)) {
        c.style.cursor = 'pointer';
    } else {
        c.style.cursor = 'default';
    }
}

// Typical is_on..-function
function is_on_top_space_ship (evt) {
    const min_x = 0;
    const max_x = 50;

    const min_y = 100;
    const max_y = 150;

    let pos = get_mouse_pos(c, evt);
    return (pos.x > min_x && pos.x < max_x) && (pos.y > min_y && pos.y < max_y);
}

// Creating the flag, completing the work of art.
let height_flag = 0;
function create_flag() {
    // completed!
    if ( height_flag < 25) {
        clear_canvas();

        ctx.beginPath();
        ctx.fillStyle = "#FFAA00";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.closePath();
        ctx.beginPath();

        ctx.drawImage(black_flag, 490, 80, 25, height_flag++);

        draw_mars();
        draw_craters();
        window.requestAnimationFrame(create_flag);
    } else {
        $("#art")
            .off('mousemove', point_at_box_on_planet)
            .off('click', start_flag);
    }
}


function is_on_top_box_on_planet (evt) {
    let min_x = 490;
    let max_x = min_x + 25;

    let min_y = 90;
    let max_y = min_y + 25;

    let pos = get_mouse_pos(c, evt);
    return (pos.x > min_x && pos.x < max_x) && (pos.y > min_y && pos.y < max_y);
}

function point_at_box_on_planet(evt) {
    if (is_on_top_box_on_planet(evt)) {
        c.style.cursor = 'pointer';
    } else {
        c.style.cursor = 'default';
    }
}

function start_flag(evt) {
    console.log("is here");
    if (is_on_top_box_on_planet(evt)) {
        console.log("ishere");
        create_flag()
    }
}

function draw_box_on_planet() {
    ctx.beginPath();
    ctx.rect(490, 90, 25, 25);
    ctx.fillStyle = 'grey';
    ctx.fill();
    ctx.closePath();
}

/** Documentation
 * This section deals with the documentation part of the website.
 * A function will be made so that the doc-div can be hidden and then opened.
 * This will be done with a standard button.
 */

let show = 0;

$("#doc-content").toggle();

// This mechanic, written using jQuery, shows the
// documentation section when the user presses the button (it is set to hidden by default).
// The text on the box also changes.
$(document).ready(function () {
    $("#doc-button").on('click', function () {
        if (show) {
            // Hide the documentation section
            $("#doc-content").toggle();
            $("#doc-button").text("Show");
            show = 0;
        } else {
            // show the documentation section.
            $("#doc-content").toggle();
            $("#doc-button").text("Hide");
            show = 1;
        }
    })
});