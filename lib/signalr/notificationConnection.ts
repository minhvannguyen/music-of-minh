import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection;

export const startNotificationConnection = async (userId: number) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7114/notificationHub?userId=${userId}`)
    .withAutomaticReconnect()
    .build();

  await connection.start();

  console.log("SignalR Connected");

  return connection;
};