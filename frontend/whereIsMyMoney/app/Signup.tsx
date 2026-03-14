import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { api } from '../services/api'

const Signup = () => {

  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignup = async () => {

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    try {

      await api.post("/users/register", {
        email,
        password
      })

      alert("Account created successfully!")

      router.replace("/Login")

    } catch (err) {
      console.log(err)
      alert("Signup failed")
    }
  }

  return (
    <View className='flex-1 justify-center items-center bg-[#f1f1f3]'>

      <View
        className='w-[90%] rounded-3xl'
        style={{
          shadowColor: '#c8c8e0',
          shadowOffset: { width: 10, height: 10 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View
          className='w-full rounded-3xl'
          style={{
            shadowColor: '#ffffff',
            shadowOffset: { width: -6, height: -6 },
            shadowOpacity: 1,
            shadowRadius: 12,
          }}
        >

          <View className='w-full rounded-3xl bg-primary justify-evenly items-center border-2 border-[#f7f7ff] py-12 gap-y-2'>

            <Text className='text-text-secondary font-bold text-5xl'>Create Account</Text>
            <Text className='text-text-muted text-lg mb-4'>Sign up to get started</Text>

            <TextInput
              placeholder='Full Name'
              value={name}
              onChangeText={setName}
              className="bg-primary rounded-full p-4 px-6 w-[90%]"
              style={{
                shadowColor: "#271873",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
            />

            <TextInput
              placeholder='Email'
              keyboardType='email-address'
              autoCapitalize='none'
              value={email}
              onChangeText={setEmail}
              className="bg-primary rounded-full p-4 px-6 w-[90%]"
              style={{
                shadowColor: "#271873",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
            />

            <TextInput
              placeholder='Password'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="bg-primary rounded-full p-4 px-6 w-[90%]"
              style={{
                shadowColor: "#271873",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
            />

            <TextInput
              placeholder='Confirm Password'
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="bg-primary rounded-full p-4 px-6 w-[90%] mb-4"
              style={{
                shadowColor: "#271873",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
            />

            <TouchableOpacity
              onPress={handleSignup}
              className='bg-secondary rounded-full flex justify-center items-center w-[90%] py-4'
              style={{
                shadowColor: "#271873",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
            >
              <Text className='text-primary font-bold text-2xl'>Sign Up</Text>
            </TouchableOpacity>

            <Text className='text-md text-text-muted mt-2'>
              Already have an account?{' '}
              <Link href="/Login" className='text-secondary font-bold text-lg'>Login</Link>
            </Text>

          </View>
        </View>
      </View>

    </View>
  )
}

export default Signup