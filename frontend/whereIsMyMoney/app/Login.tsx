import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'

const Login = () => {
  return (
    <View className='flex-1 justify-center items-center bg-[#f1f1f3]'>

      {/* Outer dark shadow — bottom-right */}
      <View
        className='w-[90%] h-[60%] rounded-3xl'
        style={{
          shadowColor: '#c8c8e0',   // muted blue-gray, matches your theme
          shadowOffset: { width: 10, height: 10 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        {/* Inner light shadow — top-left highlight */}
        <View
          className='w-full h-full rounded-3xl'
          style={{
            shadowColor: '#ffffff',
            shadowOffset: { width: -6, height: -6 },
            shadowOpacity: 1,
            shadowRadius: 12,
          }}
        >
          {/* The actual card */}
          <View
            className='w-full h-full rounded-3xl bg-primary justify-evenly items-center border-2 border-[#f7f7ff] py-12'
          >
            <Text className='text-text-secondary font-bold text-5xl'>Welcome Back</Text>
            <Text className='text-text-muted text-lg'>Login to your account</Text>
            <TextInput
                placeholder='Email'
                 className="bg-primary rounded-full p-4 px-6 mb-5 w-[90%]"
          style={{
            shadowColor: "#271873",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}/>
          <TextInput
                placeholder='Password'
                 className="bg-primary rounded-full p-4 px-6 mb-5 w-[90%]"
          style={{
            shadowColor: "#271873",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}/>
          <TouchableOpacity className='bg-secondary rounded-full flex justify-center items-center w-[90%] py-4'
          style={{
            shadowColor: "#271873",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}>
                <Text className='text-primary font-bold text-2xl'>Login</Text>
          </TouchableOpacity>

          <Text className='text-md text-text-muted'>Don&apos;t Have An Account ?<Link href="/Signup" className='text-secondary font-bold text-lg'>Signup</Link></Text>

            
          </View>

        </View>
      </View>

    </View>
  )
}

export default Login