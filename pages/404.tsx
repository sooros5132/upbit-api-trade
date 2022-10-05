import React from 'react';

const Custom404: React.FC = () => {
  return (
    <main className='flex justify-center items-center [&>div]:p-1 text-2xl'>
      <div className='pr-5'>
        <p>404</p>
      </div>
      <div className='pl-5 border-l'>
        <p>This page could not be found.</p>
      </div>
    </main>
  );
};

Custom404.displayName = 'Custom404';

export default Custom404;
