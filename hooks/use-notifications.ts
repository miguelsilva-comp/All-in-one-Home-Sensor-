import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "sensor-alerts";

let notificationHandlerConfigured = false;

function ensureNotificationHandler() {
	if (notificationHandlerConfigured) {
		return;
	}

	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	});

	notificationHandlerConfigured = true;
}

export async function configureNotifications() {
	if (Platform.OS === "web") {
		return;
	}

	ensureNotificationHandler();

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
			name: "Sensor Alerts",
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#7df0dc",
			sound: "default",
		});
	}
}

export async function requestNotificationPermissions() {
	if (Platform.OS === "web") {
		return false;
	}

	const current = await Notifications.getPermissionsAsync();
	let finalStatus = current.status;

	if (finalStatus !== "granted") {
		const requested = await Notifications.requestPermissionsAsync();
		finalStatus = requested.status;
	}

	return finalStatus === "granted";
}

export async function hasNotificationPermission() {
	if (Platform.OS === "web") {
		return false;
	}

	const current = await Notifications.getPermissionsAsync();
	return current.status === "granted";
}

export async function getNotificationPermissionStatus() {
	if (Platform.OS === "web") {
		return "unsupported" as const;
	}

	const current = await Notifications.getPermissionsAsync();
	return current.status;
}

export type LocalNotificationPayload = {
	title: string;
	body: string;
	data?: Record<string, unknown>;
};

export async function sendLocalNotification(payload: LocalNotificationPayload) {
	if (Platform.OS === "web") {
		return;
	}

	await Notifications.scheduleNotificationAsync({
		content: {
			title: payload.title,
			body: payload.body,
			data: payload.data,
			sound: true,
		},
		trigger: null,
	});
}

export async function getExpoPushToken() {
	if (Platform.OS === "web" || !Device.isDevice) {
		return null;
	}

	const hasPermission = await requestNotificationPermissions();
	if (!hasPermission) {
		return null;
	}

	const projectId =
		Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

	if (!projectId) {
		return null;
	}

	const token = await Notifications.getExpoPushTokenAsync({ projectId });
	return token.data;
}

export function addNotificationReceivedListener(
	callback: (event: Notifications.Notification) => void
) {
	return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
	callback: (response: Notifications.NotificationResponse) => void
) {
	return Notifications.addNotificationResponseReceivedListener(callback);
}

export function removeNotificationSubscription(
	subscription: Notifications.EventSubscription | null | undefined
) {
	if (!subscription) {
		return;
	}

	subscription.remove();
}
