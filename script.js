'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent;
if (navigator.geolocation)
  //get user location and renders map
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
      const coords = [latitude, longitude];

      map = L.map('map').setView(coords, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // event listener on map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        //make the from visible
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      console.log('Unable to access your location');
    }
  );

//form event listener
form.addEventListener('submit', function (e) {
  e.preventDefault();
  //adds marker to the map
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng], { riseOnHover: true })
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent(`workout`)
    .openPopup();
  inputDistance.value = '';
  inputCadence.value = '';
  inputDuration.value = '';
  inputElevation.value = '';
  // map.classList.add('hidden');
});

//changing type of workout
inputType.addEventListener('change', function (e) {
  console.log(`change detected`);
  inputCadence.closest('div.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('div.form__row').classList.toggle('form__row--hidden');
  // inputCadence.parentElement.classList.toggle('form__row--hidden');
  // form.children[4].classList.toggle('form__row--hidden');
  // inputCadence.parentElement;
  // inputDistance.parentElement;
});
