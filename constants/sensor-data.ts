export const temperatureDataset = [21.3, 21.7, 22.1, 22.6, 23.0, 22.7, 22.3, 21.9, 21.6, 21.4];
export const humidityDataset = [46, 48, 50, 52, 54, 53, 51, 49, 47, 48];
export const pressureDataset = [1012, 1011, 1011, 1010, 1009, 1010, 1011, 1012, 1013, 1014];

export const HIGH_TEMPERATURE_THRESHOLD = 26;
export const HIGH_HUMIDITY_THRESHOLD = 60;
export const LOW_PRESSURE_THRESHOLD = 1000;

type SensorListener = (value: number) => void;

let currentTemperature =
	temperatureDataset.length > 0 ? temperatureDataset[temperatureDataset.length - 1] : 0;
let currentHumidity = humidityDataset.length > 0 ? humidityDataset[humidityDataset.length - 1] : 0;
let currentPressure = pressureDataset.length > 0 ? pressureDataset[pressureDataset.length - 1] : 0;

const temperatureListeners = new Set<SensorListener>();
const humidityListeners = new Set<SensorListener>();
const pressureListeners = new Set<SensorListener>();

export function getCurrentTemperature() {
	return currentTemperature;
}

export function setCurrentTemperature(value: number) {
	if (currentTemperature === value) {
		return;
	}

	currentTemperature = value;
	temperatureListeners.forEach((listener) => listener(currentTemperature));
}

export function subscribeToTemperature(listener: SensorListener) {
	temperatureListeners.add(listener);

	return () => {
		temperatureListeners.delete(listener);
	};
}

export function getCurrentHumidity() {
	return currentHumidity;
}

export function setCurrentHumidity(value: number) {
	if (currentHumidity === value) {
		return;
	}

	currentHumidity = value;
	humidityListeners.forEach((listener) => listener(currentHumidity));
}

export function subscribeToHumidity(listener: SensorListener) {
	humidityListeners.add(listener);

	return () => {
		humidityListeners.delete(listener);
	};
}

export function getCurrentPressure() {
	return currentPressure;
}

export function setCurrentPressure(value: number) {
	if (currentPressure === value) {
		return;
	}

	currentPressure = value;
	pressureListeners.forEach((listener) => listener(currentPressure));
}

export function subscribeToPressure(listener: SensorListener) {
	pressureListeners.add(listener);

	return () => {
		pressureListeners.delete(listener);
	};
}
