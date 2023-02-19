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

class Workout {
  id = Date.now();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.date = new Date();
  }
}
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this._calcPace();
  }
  _calcPace() {
    this.pace = Math.round(this.duration / this.distance);
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this._calcSpeed();
  }
  _calcSpeed() {
    this.speed = Math.round((distance * 60) / duration);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toogleElevationField.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log('Unable to access your location');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this)); //leaflet built-in event handler
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; //sets the value for further use in the _newWorkout method
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toogleElevationField() {
    inputCadence.closest('div.form__row').classList.toggle('form__row--hidden');
    inputElevation
      .closest('div.form__row')
      .classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const checkFinite = (...values) =>
      values.every(val => Number.isFinite(val));
    const checkPositive = (...values) => values.every(val => val >= 0);

    //read and validate data
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !checkFinite(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      )
        return alert('All the inputs should be possitive number');
      console.log(new Running([lat, lng], distance, duration, cadence));
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !checkFinite(distance, duration, cadence) ||
        !checkPositive(distance, duration)
      )
        return alert('All the inputs should be possitive number');
      console.log(new Cycling([lat, lng], distance, duration, elevation));
    }

    //dislay marker
    L.marker([lat, lng], { riseOnHover: true })
      .addTo(this.#map)
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

    //clear input fields and hide form
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }
}

const app = new App();
