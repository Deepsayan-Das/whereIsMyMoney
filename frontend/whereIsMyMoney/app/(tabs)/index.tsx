import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { getRandomWelcome, getRandomThought } from '@/constants/dashboard'
import FinnAdvisor from '@/components/advisor/FinnAdvisor'
import { api } from '@/services/api'
import { SafeAreaView } from 'react-native-safe-area-context'

// ── Types ────────────────────────────────────────────────────────────────────

type AccountKind = 'saving' | 'current' | 'digitalWallet' | 'cash'

export interface Account {
  _id: string
  kind: AccountKind
  currency: string
  balance: number
  budget?: number
  budgetReached?: boolean
}

export interface Transaction {
  _id: string
  accountId: string
  amount: number
  type: 'credit' | 'debit'
  purpose: string
  note?: string
  createdAt: string
  balanceAfterTransaction: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<AccountKind, string> = {
  saving: '🏦 Savings',
  current: '🏧 Current',
  digitalWallet: '📱 Wallet',
  cash: '💵 Cash',
}

const KIND_ACCENT: Record<AccountKind, string> = {
  saving: '#2718fe',
  current: '#7c3aed',
  digitalWallet: '#0891b2',
  cash: '#16a34a',
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const NEO_SHADOW_DARK = { shadowColor: '#c8c8e0', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.7, shadowRadius: 10 }
const NEO_SHADOW_LIGHT = { shadowColor: '#ffffff', shadowOffset: { width: -5, height: -5 }, shadowOpacity: 1, shadowRadius: 10 }
const INPUT_SHADOW = { shadowColor: '#271873', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className='text-text-secondary font-bold text-lg mb-3 px-1'>
      {text}
    </Text>
  )
}

function AccountCard({ account }: { account: Account }) {
  const accent = KIND_ACCENT[account.kind]
  const hasBudget = account.budget != null && account.budget > 0
  const pctUsed = hasBudget ? Math.min((account.balance / account.budget!) * 100, 100) : 0
  const remaining = hasBudget ? account.budget! - account.balance : 0

  return (
    <View style={NEO_SHADOW_DARK} className='mr-4 rounded-2xl'>
      <View style={NEO_SHADOW_LIGHT} className='rounded-2xl'>
        <View className='bg-primary rounded-2xl p-5 w-56'>

          {/* Kind badge */}
          <View className='flex-row justify-between items-center mb-4'>
            <Text className='text-text-muted text-sm font-medium'>
              {KIND_LABEL[account.kind]}
            </Text>
            {account.budgetReached && (
              <View className='bg-error/10 px-2 py-0.5 rounded-full'>
                <Text className='text-error text-xs font-bold'>Limit hit</Text>
              </View>
            )}
          </View>

          {/* Balance */}
          <Text className='text-text-primary font-bold text-2xl mb-1'>
            {formatCurrency(account.balance, account.currency)}
          </Text>
          <Text className='text-text-muted text-xs mb-4'>{account.currency}</Text>

          {/* Budget bar */}
          {hasBudget && (
            <View>
              <View className='h-1.5 bg-border rounded-full overflow-hidden mb-1'>
                <View
                  className='h-full rounded-full'
                  style={{ width: `${pctUsed}%`, backgroundColor: account.budgetReached ? '#ef4444' : accent }}
                />
              </View>
              <Text className='text-text-muted text-xs'>
                {formatCurrency(remaining, account.currency)} left of {formatCurrency(account.budget!, account.currency)}
              </Text>
            </View>
          )}

        </View>
      </View>
    </View>
  )
}

function TransactionRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === 'credit'
  return (
    <View style={INPUT_SHADOW} className='bg-primary rounded-2xl px-4 py-3 mb-3 flex-row items-center justify-between'>
      {/* Left */}
      <View className='flex-row items-center gap-x-3'>
        <View
          className='w-9 h-9 rounded-full items-center justify-center'
          style={{ backgroundColor: isCredit ? '#dcfce7' : '#fee2e2' }}
        >
          <Text className='text-base'>{isCredit ? '↓' : '↑'}</Text>
        </View>
        <View>
          <Text className='text-text-primary font-semibold text-sm'>{txn.purpose}</Text>
          <Text className='text-text-muted text-xs'>{formatDate(txn.createdAt)}</Text>
        </View>
      </View>

      {/* Right */}
      <Text
        className='font-bold text-base'
        style={{ color: isCredit ? '#16a34a' : '#ef4444' }}
      >
        {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
      </Text>
    </View>
  )
}

function BudgetSummaryCard({ accounts }: { accounts: Account[] }) {
  const budgeted = accounts.filter(a => a.budget && a.budget > 0)
  if (budgeted.length === 0) return null

  const totalBudget = budgeted.reduce((s, a) => s + a.budget!, 0)
  const totalSpent = budgeted.reduce((s, a) => s + a.balance, 0)
  const totalPct = Math.min((totalSpent / totalBudget) * 100, 100)
  const overallSafe = totalPct < 80

  return (
    <View style={NEO_SHADOW_DARK} className='rounded-2xl mb-6'>
      <View style={NEO_SHADOW_LIGHT} className='rounded-2xl'>
        <View className='bg-primary rounded-2xl p-5'>

          <View className='flex-row justify-between items-center mb-3'>
            <Text className='text-text-secondary font-bold text-base'>Overall Budget</Text>
            <View
              className='px-3 py-0.5 rounded-full'
              style={{ backgroundColor: overallSafe ? '#dcfce7' : '#fee2e2' }}
            >
              <Text
                className='text-xs font-bold'
                style={{ color: overallSafe ? '#16a34a' : '#ef4444' }}
              >
                {overallSafe ? 'On Track' : 'Over Limit'}
              </Text>
            </View>
          </View>

          {/* Big bar */}
          <View className='h-3 bg-border rounded-full overflow-hidden mb-2'>
            <View
              className='h-full rounded-full'
              style={{
                width: `${totalPct}%`,
                backgroundColor: overallSafe ? '#2718fe' : '#ef4444',
              }}
            />
          </View>

          <View className='flex-row justify-between'>
            <Text className='text-text-muted text-xs'>
              Spent ₹{totalSpent.toLocaleString('en-IN')}
            </Text>
            <Text className='text-text-muted text-xs'>
              Budget ₹{totalBudget.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Per-account rows */}
          <View className='mt-4 gap-y-2'>
            {budgeted.map(a => {
              const pct = Math.min((a.balance / a.budget!) * 100, 100)
              const accent = KIND_ACCENT[a.kind]
              return (
                <View key={a._id} className='flex-row items-center gap-x-3'>
                  <Text className='text-text-muted text-xs w-20'>{KIND_LABEL[a.kind]}</Text>
                  <View className='flex-1 h-1.5 bg-border rounded-full overflow-hidden'>
                    <View
                      className='h-full rounded-full'
                      style={{ width: `${pct}%`, backgroundColor: a.budgetReached ? '#ef4444' : accent }}
                    />
                  </View>
                  <Text className='text-text-muted text-xs w-10 text-right'>{Math.round(pct)}%</Text>
                </View>
              )
            })}
          </View>

        </View>
      </View>
    </View>
  )
}

// ── FAB ───────────────────────────────────────────────────────────────────────

function FAB({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const rotation = useState(new Animated.Value(0))[0]
  const menuOpacity = useState(new Animated.Value(0))[0]
  const menuTranslate = useState(new Animated.Value(20))[0]

  function toggle() {
    const toOpen = !open
    setOpen(toOpen)
    Animated.parallel([
      Animated.timing(rotation, { toValue: toOpen ? 1 : 0, duration: 220, useNativeDriver: true }),
      Animated.timing(menuOpacity, { toValue: toOpen ? 1 : 0, duration: 200, useNativeDriver: true }),
      Animated.timing(menuTranslate, { toValue: toOpen ? 0 : 20, duration: 200, useNativeDriver: true }),
    ]).start()
  }

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] })

  const actions = [
    { label: 'Add Transaction', icon: '💸', onPress: () => { toggle(); router.push('/transactions/new') } },
    { label: 'Add Account', icon: '🏦', onPress: () => { toggle(); router.push('/account/new') } },
  ]

  return (
    <View className='absolute bottom-8 right-6 items-end gap-y-3'>

      {/* Action menu */}
      <Animated.View
        style={{ opacity: menuOpacity, transform: [{ translateY: menuTranslate }] }}
        pointerEvents={open ? 'auto' : 'none'}
        className='gap-y-2 items-end'
      >
        {actions.map(action => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            className='flex-row items-center gap-x-3'
          >
            {/* Label pill */}
            <View
              className='bg-primary px-4 py-2 rounded-full'
              style={INPUT_SHADOW}
            >
              <Text className='text-text-primary font-semibold text-sm'>{action.label}</Text>
            </View>

            {/* Icon circle */}
            <View
              className='w-12 h-12 bg-secondary rounded-full items-center justify-center'
              style={INPUT_SHADOW}
            >
              <Text className='text-xl'>{action.icon}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Main FAB */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.85}
        className='w-16 h-16 bg-secondary rounded-full items-center justify-center'
        style={{
          shadowColor: '#2718fe',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Animated.Text
          style={{ transform: [{ rotate }], color: '#f7f7ff', fontSize: 32, lineHeight: 36 }}
        >
          +
        </Animated.Text>
      </TouchableOpacity>

    </View>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData()
    }, [])
  )

  const fetchDashboardData = async () => {
    setRefreshing(true)
    try {
      const accountsRes = await api.get("/users/get-all-accounts")
      const transactionsRes = await api.get("/users/get-all-transactions")

      setAccounts(accountsRes.data.accounts || [])
      setTransactions(transactionsRes.data.transactions || [])
    } catch (err) {
      console.log("Dashboard fetch error", err)
    } finally {
      setRefreshing(false)
    }
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const { greeting, subtitle } = getRandomWelcome()
  const thought = getRandomThought()

  return (
    <SafeAreaView className='flex-1 bg-[#f1f1f3]' edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} />
        }
      >
        {/* ── Branding Header ── */}
        <View className='px-6 pt-6 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-x-2'>
            <Image
              source={require('../../assets/images/logo.png')}
              className='w-10 h-10'
              resizeMode='contain'
            />
            <Text className='text-text-primary font-black text-2xl tracking-tighter'>WIMM</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className='w-10 h-10 rounded-full bg-border items-center justify-center'
          >
            <Text className='text-lg'>👤</Text>
          </TouchableOpacity>
        </View>

        {/* ── Welcome Header ── */}
        <View className='px-6 pt-8 pb-6'>
          <Text className='text-text-muted text-base'>{greeting}</Text>
          <Text className='text-text-primary font-bold text-3xl mt-1'>{subtitle}</Text>

          {/* Total balance hero */}
          <View style={[NEO_SHADOW_DARK, { marginTop: 20 }]} className='rounded-3xl'>
            <View style={NEO_SHADOW_LIGHT} className='rounded-3xl'>
              <View className='bg-secondary rounded-3xl px-6 py-6'>
                <Text className='text-muted text-sm mb-1'>Total Balance</Text>
                <Text className='text-primary font-bold text-5xl'>
                  {formatCurrency(totalBalance, 'INR')}
                </Text>
                <Text className='text-muted text-xs mt-1'>
                  across {accounts.length} accounts
                </Text>
              </View>
            </View>
          </View>

          {/* Thought of the day */}
          <View style={[NEO_SHADOW_DARK, { marginTop: 16 }]} className='rounded-2xl'>
            <View style={NEO_SHADOW_LIGHT} className='rounded-2xl'>
              <View className='bg-primary rounded-2xl px-5 py-4'>
                <Text className='text-text-muted text-xs font-semibold mb-1 uppercase tracking-widest'>
                  Thought of the day
                </Text>
                <Text className='text-text-secondary text-sm leading-5'>{thought}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Account Cards ── */}
        <View className='px-6 mb-6'>
          <SectionLabel text='Accounts' />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map(acc => (
              <AccountCard key={acc._id} account={acc} />
            ))}
          </ScrollView>
        </View>

        {/* ── Budget Summary ── */}
        <View className='px-6 mb-2'>
          <SectionLabel text='Budget Overview' />
          <BudgetSummaryCard accounts={accounts} />
        </View>

        {/* ── Recent Transactions ── */}
        <View className='px-6'>
          <View className='flex-row justify-between items-center mb-3'>
            <SectionLabel text='Recent Transactions' />
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text className='text-secondary font-bold text-sm'>View All</Text>
            </TouchableOpacity>
          </View>
          {transactions.slice(0, 5).map(txn => (
            <TransactionRow key={txn._id} txn={txn} />
          ))}
        </View>

      </ScrollView>

      {/* ── FAB ── */}
      <FAB open={fabOpen} setOpen={setFabOpen} />
      <FinnAdvisor accounts={accounts} transactions={transactions} isFabOpen={fabOpen} />
    </SafeAreaView>
  )
}
