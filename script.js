'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//selectors
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

////////////////////////////////////////
// data classes
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
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._calcPace();
  }
  _calcPace() {
    this.pace = Math.round(this.duration / this.distance);
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this._calcSpeed();
  }
  _calcSpeed() {
    this.speed = Math.round((this.distance * 60) / this.duration);
    return this.speed;
  }
}
/////////////////////////////////////////////////////
// app class
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toogleElevationField.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), //need to bind this keyword in callback functions
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

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //read and validate data
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !checkFinite(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      )
        return alert('All the inputs should be possitive number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !checkFinite(distance, duration, elevation) ||
        !checkPositive(distance, duration)
      )
        return alert('All the inputs should be possitive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //save workout data
    this.#workouts.push(workout);

    //render workout
    this._renderWorkout(workout);

    //dislay marker
    this._displayMarker(workout);
  }

  _displayMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
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
  _renderWorkout(workout) {}

  get workouts() {
    return this.#workouts;
  }
}

const app = new App();
