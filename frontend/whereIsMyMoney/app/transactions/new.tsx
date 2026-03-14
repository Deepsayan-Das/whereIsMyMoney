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

interface Account {
  _id: string
  kind: AccountKind
  currency: string
  balance: number
}

const KIND_LABEL: Record<AccountKind, string> = {
  saving: '🏦 Savings', current: '🏧 Current', digitalWallet: '📱 Wallet', cash: '💵 Cash',
}

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

export default function AddTransaction() {
  const [accounts,  setAccounts]  = React.useState<Account[]>([])
  const [accountId, setAccountId] = useState('')
  const [type,      setType]      = useState<'credit' | 'debit'>('debit')
  const [amount,    setAmount]    = useState('')
  const [purpose,   setPurpose]   = useState('')
  const [note,      setNote]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [error,     setError]     = useState('')

  React.useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const res = await api.get('/users/get-all-accounts')
      const accountsData = res.data.accounts || []
      setAccounts(accountsData)
      if (accountsData.length > 0) {
        setAccountId(accountsData[0]._id)
      }
    } catch {
      setError('Failed to fetch accounts')
    } finally {
      setAccountsLoading(false)
    }
  }

  const selectedAccount = accounts.find(a => a._id === accountId)
  const parsedAmount    = parseFloat(amount) || 0
  const balanceAfter    = selectedAccount 
    ? (type === 'credit' ? selectedAccount.balance + parsedAmount : selectedAccount.balance - parsedAmount)
    : 0

  async function handleSubmit() {
    if (!amount)  { setError('Amount is required');  return }
    if (!purpose) { setError('Purpose is required'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/transactions/create-transaction', {
        accountId, type, purpose,
        amount: parsedAmount,
        ...(note ? { note } : {}),
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

        <Text className='text-text-primary font-bold text-4xl mb-1'>New Transaction</Text>
        <Text className='text-text-muted text-base mb-8'>Record money moving in or out</Text>

        {/* Live balance preview */}
        <View style={[NEO_DARK, { marginBottom: 20 }]} className='rounded-2xl'>
          <View style={NEO_LIGHT} className='rounded-2xl'>
            <View className='bg-primary rounded-2xl px-6 py-4 flex-row items-center justify-between'>
              <View>
                <Text className='text-text-muted text-xs mb-0.5'>Current Balance</Text>
                <Text className='text-text-primary font-bold text-2xl'>
                  ₹{selectedAccount ? selectedAccount.balance.toLocaleString('en-IN') : '0'}
                </Text>
              </View>
              {amount !== '' && !isNaN(parsedAmount) && (
                <View className='items-end'>
                  <Text className='text-text-muted text-xs mb-0.5'>After this txn</Text>
                  <Text
                    className='font-bold text-2xl'
                    style={{ color: balanceAfter < 0 ? '#ef4444' : type === 'credit' ? '#16a34a' : '#2718fe' }}
                  >
                    ₹{balanceAfter.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Main card */}
        <View style={NEO_DARK} className='rounded-3xl'>
          <View style={NEO_LIGHT} className='rounded-3xl'>
            <View className='bg-primary rounded-3xl p-6'>

              <Text className='text-text-secondary font-bold text-base mb-3'>Account</Text>
              {accountsLoading ? (
                <ActivityIndicator size="small" color="#2718fe" />
              ) : (
                <ChipSelector
                  options={accounts.map(a => ({ value: a._id, label: KIND_LABEL[a.kind] }))}
                  selected={accountId}
                  onSelect={setAccountId}
                />
              )}

              <Text className='text-text-secondary font-bold text-base mb-3'>Type</Text>
              <ChipSelector
                options={[
                  { value: 'credit' as const, label: 'Money In',  icon: '↓' },
                  { value: 'debit'  as const, label: 'Money Out', icon: '↑' },
                ]}
                selected={type}
                onSelect={setType}
              />

              <Text className='text-text-secondary font-bold text-base mb-3'>Amount</Text>
              <NeoInput placeholder='0.00' value={amount} onChangeText={setAmount} keyboardType='numeric' prefix={selectedAccount?.currency || 'INR'} />

              <Text className='text-text-secondary font-bold text-base mb-3'>Purpose</Text>
              <NeoInput placeholder='e.g. Groceries, Salary, Rent…' value={purpose} onChangeText={setPurpose} />

              <Text className='text-text-secondary font-bold text-base mb-3'>Note (optional)</Text>
              <NeoInput placeholder='Any extra details' value={note} onChangeText={setNote} />

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
                  : <Text className='text-primary font-bold text-xl'>
                      {type === 'credit' ? 'Record Income' : 'Record Expense'}
                    </Text>
                }
              </TouchableOpacity>

            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}