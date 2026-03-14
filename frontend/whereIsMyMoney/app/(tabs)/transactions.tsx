import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '@/services/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Transaction } from './index'

const INPUT_SHADOW = { shadowColor: '#271873', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TransactionRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === 'credit'
  return (
    <View style={INPUT_SHADOW} className='bg-primary rounded-2xl px-4 py-4 mb-3 flex-row items-center justify-between'>
      {/* Left */}
      <View className='flex-row items-center gap-x-4'>
        <View
          className='w-12 h-12 rounded-full items-center justify-center'
          style={{ backgroundColor: isCredit ? '#dcfce7' : '#fee2e2' }}
        >
          <Text className='text-xl'>{isCredit ? '↓' : '↑'}</Text>
        </View>
        <View>
          <Text className='text-text-primary font-bold text-base'>{txn.purpose}</Text>
          <Text className='text-text-muted text-xs'>{formatDate(txn.createdAt)}</Text>
          {txn.note && (
            <Text className='text-text-muted text-[10px] mt-0.5 italic'>&quot;{txn.note}&quot;</Text>
          )}
        </View>
      </View>

      {/* Right */}
      <View className='items-end'>
        <Text
          className='font-black text-lg'
          style={{ color: isCredit ? '#16a34a' : '#ef4444' }}
        >
          {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
        </Text>
        <Text className='text-text-muted text-[10px]'>Bal: ₹{txn.balanceAfterTransaction.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  )
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchTransactions()
    }, [])
  )

  const fetchTransactions = async () => {
    setRefreshing(true)
    try {
      const res = await api.get("/users/get-all-transactions")
      setTransactions(res.data.transactions || [])
    } catch (err) {
      console.log("Transactions fetch error", err)
    } finally {
      setRefreshing(false)
    }
  }

  const filtered = transactions.filter(t => 
    t.purpose.toLowerCase().includes(search.toLowerCase()) ||
    t.note?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView className='flex-1 bg-[#f1f1f3]' edges={['top', 'right', 'left', 'bottom']}>
      <View className='px-6 pt-6 pb-4'>
        <View className='flex-row items-center gap-x-2 mb-6'>
          <Image 
            source={require('../../assets/images/logo.png')} 
            className='w-8 h-8'
            resizeMode='contain'
          />
          <Text className='text-text-primary font-black text-xl tracking-tighter'>WIMM History</Text>
        </View>

        <View style={INPUT_SHADOW} className='bg-primary rounded-2xl px-4 flex-row items-center'>
          <Text className='mr-2'>🔍</Text>
          <TextInput
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            className='flex-1 py-4 text-text-primary font-medium'
          />
        </View>
      </View>

      <ScrollView
        className='flex-1 px-6'
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
        }
      >
        {filtered.length === 0 ? (
          <View className='items-center justify-center py-20'>
            <Text className='text-text-muted text-lg font-bold'>No transactions found</Text>
          </View>
        ) : (
          filtered.map(txn => (
            <TransactionRow key={txn._id} txn={txn} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
