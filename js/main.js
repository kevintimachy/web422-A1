/*********************************************************************************
*  WEB422 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Kevin Timachy Student ID: 145075180 Date: 02/06/23
*
********************************************************************************/ 

var tripData = [];
var currentTrip = {};
var page = 1;
var perPage = 10;
var map = null;


function objectToTableRow(trip)
{
    return `<tr data-id="${trip._id}" class="${trip.usertype}">
                <td>${trip.bikeid}</td>
                <td>${trip["start station name"]}</td>
                <td>${trip["end station name"]}</td>
                <td>${(trip.tripduration / 60).toFixed(2)}</td>
            </tr>`;

}

function loadTripData()
{
    let url = `https://burgundy-sheep-toga.cyclic.app/api/trips?page=${page}&perPage=${perPage}`;

    fetch(url).then(res => res.json()).then(data => {
        tripData = data;
        let tripRows = tripData.map(objectToTableRow).join('');
        document.querySelector('#trips-table tbody').innerHTML = tripRows;

        document.querySelectorAll('#trips-table tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                let clickedId = row.getAttribute('data-id');

                currentTrip = tripData.find( t => t._id == clickedId);

                document.querySelector('#trip-modal .modal-title').innerHTML = `Trip Details (Bike: ${currentTrip.bikeid})`;

                document.querySelector('#map-details').innerHTML =
                    `<ul class="list-unstyled">
                    <li><strong>Start Location:</strong> ${currentTrip['end station name']}</li>
                    <li><strong>End Location:</strong> ${currentTrip['start station name']}</li>
                    <li><strong>Duration:</strong> ${(currentTrip.tripduration / 60).toFixed(2)} Minutes</li>
                    </ul>`;

                let modal = new bootstrap.Modal(document.getElementById("trip-modal"), {
                                    backdrop: "static",
                                    keyboard: false
                                });

                modal.show();

            })
        });
        document.querySelector('#current-page').innerHTML = `${page}`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTripData();

    

    document.querySelector('#previous-page').addEventListener('click', (e) => {
        if (page > 1) {
            page--;
            loadTripData();
        }
    });

    document.querySelector('#next-page').addEventListener('click', (e) => {
        page++;
        loadTripData();
        
    });

    document.querySelector("#trip-modal").addEventListener("shown.bs.modal", function () {
        map = new L.Map('leaflet', {
            layers: [
                new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ]
        });

        let start = L.marker([currentTrip["start station location"]["coordinates"][1], currentTrip["start station location"]["coordinates"][0]])
            .bindTooltip(currentTrip["start station name"],
                {
                    permanent: true,
                    direction: 'right'
                }).addTo(map);

        let end = L.marker([currentTrip["end station location"]["coordinates"][1], currentTrip["end station location"]["coordinates"][0]])
            .bindTooltip(currentTrip["end station name"],
                {
                    permanent: true,
                    direction: 'right'
                }).addTo(map);

        var group = new L.featureGroup([start, end]);

        map.fitBounds(group.getBounds(), { padding: [60, 60] });

    });

    document.querySelector("#trip-modal").addEventListener("hidden.bs.modal", function () {
        console.log("close map");
        map.remove();
    })
});