import React from 'react';
import ConnectionTable from '@/components/ConnectionTable';

interface ConnectionsProps {
  todoistToken: string | null;
  notionToken: string | null;
}

const Page = async () => {
  const response = await fetch('http://localhost:3000/api/connections/', {
    cache: 'no-store',
  });
  const data = await response.json();
  const connections: ConnectionsProps = data.data;

  return (
    <div>
      <ConnectionTable connections={connections} />
    </div>
  );
};

export default Page;
