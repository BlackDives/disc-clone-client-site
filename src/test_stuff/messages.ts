type MessageProps = {
    id: string
    messageContent: string
    user: string
    date: string
    time: string
}

export const TestMessages: MessageProps[] = [
    {
        id: '1',
        messageContent: 'Hey, how’s the project coming along?',
        user: 'Alice',
        date: '2025-10-21',
        time: '09:15 AM',
    },
    {
        id: '2',
        messageContent:
            'Pretty good! Just wrapping up the last few components.',
        user: 'Bob',
        date: '2025-10-21',
        time: '09:17 AM',
    },
    {
        id: '3',
        messageContent: 'Nice. Do you need help with the deployment script?',
        user: 'Alice',
        date: '2025-10-21',
        time: '09:19 AM',
    },
    {
        id: '4',
        messageContent:
            'That would be awesome. I’m running into some permission issues.',
        user: 'Bob',
        date: '2025-10-21',
        time: '09:22 AM',
    },
    {
        id: '5',
        messageContent: 'Got it. I’ll take a look after the stand-up.',
        user: 'Alice',
        date: '2025-10-21',
        time: '09:25 AM',
    },
    {
        id: '6',
        messageContent: 'Thanks! I’ll send you the logs in a bit.',
        user: 'Bob',
        date: '2025-10-21',
        time: '09:27 AM',
    },
]

export const ChannelMessages = [
    {
        id: '1',
        messageContent: 'Hey everyone! How’s your day going?',
        user: 'Alice',
        date: '2025-10-22',
        time: '09:12',
    },
    {
        id: '2',
        messageContent: 'Pretty good! Just finishing up some work.',
        user: 'Bob',
        date: '2025-10-22',
        time: '09:14',
    },
    {
        id: '3',
        messageContent: 'Same here. Coffee is keeping me alive ☕',
        user: 'Charlie',
        date: '2025-10-22',
        time: '09:15',
    },
    {
        id: '4',
        messageContent: 'Haha, I feel that. What are you all working on?',
        user: 'Alice',
        date: '2025-10-22',
        time: '09:17',
    },
    {
        id: '5',
        messageContent: 'Debugging a weird API issue… been at it for hours 😅',
        user: 'Bob',
        date: '2025-10-22',
        time: '09:19',
    },
    {
        id: '6',
        messageContent: "I'm designing a dashboard layout in Figma.",
        user: 'Dana',
        date: '2025-10-22',
        time: '09:21',
    },
    {
        id: '7',
        messageContent:
            'Nice! Make sure to share screenshots when it’s ready 👀',
        user: 'Charlie',
        date: '2025-10-22',
        time: '09:23',
    },
    {
        id: '8',
        messageContent: 'Will do! Anyone up for a quick call later?',
        user: 'Dana',
        date: '2025-10-22',
        time: '09:25',
    },
    {
        id: '9',
        messageContent: 'Sure, I’m free after 10.',
        user: 'Alice',
        date: '2025-10-22',
        time: '09:26',
    },
    {
        id: '10',
        messageContent: 'Same here. Let’s do it!',
        user: 'Bob',
        date: '2025-10-22',
        time: '09:27',
    },
]
