import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { api } from '@/services/api'

type AccountKind = 'saving' | 'current' | 'digitalWallet' | 'cash'
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'NZD' | 'JPY' | 'CNY' | 'RMB'

const ACCOUNT_KINDS: { value: AccountKind; label: string; icon: string }[] = [
  { value: 'saving',        label: 'Savings',        icon: '🏦' },
  { value: 'current',       label: 'Current',        icon: '🏧' },
  { value: 'digitalWallet', label: 'Digital Wallet', icon: '📱' },
  { value: 'cash',          label: 'Cash',           icon: '💵' },
]

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD', 'JPY', 'CNY', 'RMB']

const NEO_DARK  = { shadowColor: '#c8c8e0', shadowOffset: { width: 6,  height: 6  }, shadowOpacity: 0.7, shadowRadius: 10 }
const NEO_LIGHT = { shadowColor: '#ffffff',  shadowOffset: { width: -5, height: -5 }, shadowOpacity: 1,   shadowRadius: 10 }
const INPUT_SHD = { shadowColor: '#271873',  shadowOffset: { width: 3,  height: 3  }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }

function NeoInput({ placeholder, value, onChangeText, keyboardType = 'default', prefix }: {
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  keyboardType?: 'default' | 'numeric'
  prefix?: string
}) {
  return (
    <View className='flex-row items-center bg-primary rounded-2xl px-4 mb-4 w-full' style={INPUT_SHD}>
      {prefix && <Text className='text-text-muted text-base mr-2'>{prefix}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor='#8b8ba3'
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className='flex-1 text-text-primary text-base py-4'
      />
    </View>
  )
}

function ChipSelector<T extends string>({ options, selected, onSelect }: {
  options: { value: T; label: string; icon?: string }[]
  selected: T
  onSelect: (v: T) => void
}) {
  return (
    <View className='flex-row flex-wrap gap-2 mb-4'>
      {options.map(opt => {
        const active = selected === opt.value
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className='rounded-2xl px-4 py-2.5 flex-row items-center gap-x-1.5'
            style={active ? { backgroundColor: '#2718fe', ...INPUT_SHD } : { backgroundColor: '#f7f7ff', ...INPUT_SHD }}
          >
            {opt.icon && <Text className='text-sm'>{opt.icon}</Text>}
            <Text className='text-sm font-semibold' style={{ color: active ? '#f7f7ff' : '#4b4b63' }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function AddAccount() {
  const [kind,    setKind]    = useState<AccountKind>('saving')
  const [currency,setCurrency]= useState<Currency>('INR')
  const [balance, setBalance] = useState('')
  const [budget,  setBudget]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    if (!balance) { setError('Opening balance is required'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/accounts/create-account', {
        kind, currency,
        balance: parseFloat(balance),
        ...(budget ? { budget: parseFloat(budget) } : {}),
      })
      router.back()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='flex-1 bg-[#f1f1f3]'>
      <ScrollView className='flex-1 px-6' contentContainerStyle={{ paddingTop: 64, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className='flex-row items-center gap-x-2 mb-8'>
          <View className='w-9 h-9 bg-primary rounded-full items-center justify-center' style={INPUT_SHD}>
            <Text className='text-text-secondary font-bold text-base'>←</Text>
          </View>
          <Text className='text-text-muted text-sm font-medium'>Back</Text>
        </TouchableOpacity>

        <Text className='text-text-primary font-bold text-4xl mb-1'>New Account</Text>
        <Text className='text-text-muted text-base mb-8'>Set up a new account to track</Text>

        <View style={NEO_DARK} className='rounded-3xl'>
          <View style={NEO_LIGHT} className='rounded-3xl'>
            <View className='bg-primary rounded-3xl p-6'>

              <Text className='text-text-secondary font-bold text-base mb-3'>Account Type</Text>
              <ChipSelector options={ACCOUNT_KINDS} selected={kind} onSelect={setKind} />

              <Text className='text-text-secondary font-bold text-base mb-3'>Currency</Text>
              <ChipSelector options={CURRENCIES.map(c => ({ value: c, label: c }))} selected={currency} onSelect={setCurrency} />

              <Text className='text-text-secondary font-bold text-base mb-3'>Opening Balance</Text>
              <NeoInput placeholder='0.00' value={balance} onChangeText={setBalance} keyboardType='numeric' prefix={currency} />

              <Text className='text-text-secondary font-bold text-base mb-3'>Monthly Budget (optional)</Text>
              <NeoInput placeholder='Leave blank for no limit' value={budget} onChangeText={setBudget} keyboardType='numeric' prefix={currency} />

              {error ? (
                <View className='bg-error/10 rounded-xl px-4 py-3 mb-4'>
                  <Text className='text-error text-sm font-medium'>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className='bg-secondary rounded-2xl w-full py-4 items-center mt-2'
                style={{ shadowColor: '#2718fe', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
              >
                {loading
                  ? <ActivityIndicator color='#f7f7ff' />
                  : <Text className='text-primary font-bold text-xl'>Create Account</Text>
                }
              </TouchableOpacity>

            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}