import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection;

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "";

export const startNotificationConnection = async (userId: number) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/notificationHub?userId=${userId}`)
    .withAutomaticReconnect()
    .build();

  await connection.start();

  console.log("SignalR Connected");

  return connection;
};