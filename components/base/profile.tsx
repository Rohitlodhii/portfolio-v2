"use client"
import React, { useState } from 'react'

const ProfilePage = () => {

  const [isOnline] = useState<boolean>(true);

  return (
     <section className="pt-16">
        <div className="flex flex-col gap-1"> 
            <h1 className="font-medium">Rohit lodhi</h1>     
              <div className='text-muted-foreground font-medium text-sm '>

                        {isOnline ? (
                         <div className="flex items-center gap-1 bg-border/30 max-w-fit px-2 rounded-lg"> 
                            <div className="bg-green-500 h-1.5 w-1.5 rounded-full"></div>
                            <h1 className="text-xs">Online</h1>
                         </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-border/30 max-w-fit px-2 rounded-lg"> 
                            <div className="bg-red-400 h-1.5 w-1.5 rounded-full"></div>
                            <h1 className="text-xs">Offline</h1>
                         </div>
                        )}

                </div>    
        </div>
    </section>
  )
}

export default ProfilePage
