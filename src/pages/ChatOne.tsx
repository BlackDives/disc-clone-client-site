import * as React from "react";
import * as signalR from "@microsoft/signalr";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  username: string;
  messageContent: string;
  time: string;
};

const ChatOne = () => {
  const [userId, setUserId] = useState(1);
  const [chatRoom, setChatRoom] = useState("chat1");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  useEffect(() => {
    const connectToServer = () => {
      if (connection) {
        console.log("connection already exists");
        return;
      }

      console.log("building a new connection");

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7008/chatHub")
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    };
    connectToServer();
  }, []);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          console.log("disconnecting");
          await connection?.stop();
        } catch (err) {
          console.error("stop failed", err);
        }
      })();
    };
  }, [connection]);

  useEffect(() => {
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      connection
        .start()
        .then(() => {
          // connection.invoke("GetConnectionId").then((id) => {
          //   console.log(`connection id: ${id}`);
          // });
          connection
            .invoke("JoinRoom", "chat1")
            .then(() => {
              console.log("joining chat room one");
            })
            .catch((err) => {
              console.error(`error joining room: ${err}`);
            });
          console.log("Connected");

          connection.on("ReceiveMessage", (user, message) => {
            console.log(`Received notification from ${user}: ${message}`);
          });

          connection.on("ReceiveGroupMessage", (user, message, roomName) => {
            const newMessage = {
              id: "1",
              username: user,
              messageContent: message,
              time: "9:41PM",
            };
            setChatMessages((oldMessages) => [...oldMessages, newMessage]);
            console.log(
              `Received message in group ${user} from user ${message}. Message: ${roomName}`
            );
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [connection]);

  const messages = [
    {
      messageId: 1,
      userId: 1,
      username: "KamNotKam",
      messageContent: "Yooo, what's up everyone?",
      date: "10/4/2025",
      time: "6:48PM",
    },
    {
      messageId: 2,
      userId: 1,
      username: "KamNotKam",
      messageContent: "Is anyone else here?...",
      date: "10/4/2025",
      time: "6:51PM",
    },
    {
      messageId: 3,
      userId: 2,
      username: "JeffGust95",
      messageContent: "Hey, how are you bro?",
      date: "10/4/2025",
      time: "6:52PM",
    },
    {
      messageId: 4,
      userId: 1,
      username: "KamNotKam",
      messageContent: "finally some life lol",
      date: "10/4/2025",
      time: "6:52PM",
    },
    {
      messageId: 5,
      userId: 1,
      username: "KamNotKam",
      messageContent: "im chillin man",
      date: "10/4/2025",
      time: "6:53PM",
    },
  ];
  return (
    <div className="bg-gray-700 h-full">
      <div className="flex flex-col items-start justify-center p-5 bg-gray-800 h-[10%]">
        <h1 className="font-bold text-white text-xl">Chatroom One</h1>
      </div>
      <div className="flex flex-row justify-start h-[90%] w-full p-5">
        <div className="w-[10%]">
          <Button>Call One</Button>
        </div>
        <div className="flex flex-col justify-end w-[90%]">
          <div className="flex flex-col items-center">
            {chatMessages.map((data, index) => {
              return (
                <div className="flex flex-col mb-4 w-full" key={index}>
                  <div className="flex flex-row">
                    <div className="mr-5">
                      <p className="text-sm">{data.username}</p>
                    </div>
                    <div>
                      <p className="text-sm">{data.time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg text-white">{data.messageContent}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-center w-full">
            <div className="mb-2 w-[50%]">
              <Input
                className=""
                placeholder="name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="w-[50%] mb-2">
              <Textarea
                className=""
                placeholder="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="w-[20%]">
              <Button
                className="w-full bg-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  connection
                    ?.invoke("SendGroupMessage", username, message, chatRoom)
                    .then(() => {
                      console.log("message sent");
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }}
              >
                Send
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  console.log(chatMessages);
                }}
              >
                Show Array
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOne;
