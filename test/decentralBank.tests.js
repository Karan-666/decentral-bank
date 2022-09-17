const Tether = artifacts.require('Tether')
const RWD = artifacts.require('RWD')
const DecentralBank = artifacts.require('DecentralBank')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank', ([owner, customer]) => {
	let tether, rwd, decentralBank

	function tokens(number) {
		return web3.utils.toWei(number, 'ether')
	}


	before(async () => {
		// Load Contracts
		tether = await Tether.new()
		rwd = await RWD.new()
		decentralBank = await DecentralBank.new(rwd.address, tether.address)

		// Transfer all tokens to DecentralBank (1 million)
		await rwd.transfer(decentralBank.address, tokens('1000000'))
		// Transfer 100 mock Tethers to customer
		await tether.transfer(customer, tokens('100'), {from: owner})

	})

	describe('Mock Tether Deployment', async () => {
		it('matches name successfully', async () => {
			//let tether = await Tether.new()
			const name = await tether.name()
			assert.equal(name, 'Mock Tether Token')
		})
	})

	describe('Reward Token Deployment', async () => {
		it('matches name successfully', async () => {
			//let reward = await RWD.new()
			const name = await rwd.name()
			assert.equal(name, 'Reward Token')
		})
	})

	describe('Decentral Bank Deployment', async () => {
		it('matches name successfully', async () => {
			//let reward = await RWD.new()
			const name = await decentralBank.name()
			assert.equal(name, 'Decentral Bank')
		})

		it('contract has tokens', async() => {
			balance = await rwd.balanceOf(decentralBank.address)
			assert.equal(balance, tokens('1000000'))
		})

	})


	describe('yield Farming', async () => {
		it('rewards tokens for staking', async () => {
			let result

		// Check Investor Balance
		result = await tether.balanceOf(customer)
		assert.equal(result.toString(), tokens('100'), 'customer mock wallet balance before staking')
		 
		// check Staking For customer of 100 tokens
		await tether.approve(decentralBank.address, tokens('100'), {from: customer})
		await decentralBank.depositTokens(tokens('100'), {from: customer})

		// check updated Balance of Customer
		result = await tether.balanceOf(customer)
		assert.equal(result.toString(), tokens('0'), 'customer mock wallet balance after staking 100 tokens')

		// check updated Balance of Decentral Bank
		result = await tether.balanceOf(decentralBank.address)
		assert.equal(result.toString(), tokens('100'), 'decentral bank mock wallet balance after staking from customer')

		// Is staking update
		result = await decentralBank.isStaking(customer)
		assert.equal(result.toString(), 'true', 'customer is staking status after staking')

		// issue tokens
		await decentralBank.issueTokens({from: owner})
		
		// Ensure Only The owner can issue tokens
		await decentralBank.issueTokens({from: customer}).should.be.rejected;

		// unstake tokens
		await decentralBank.unstakeTokens({from: customer})

		// check unstaking balances
		result = await tether.balanceOf(customer)
		assert.equal(result.toString(), tokens('100'), 'customer mock wallet balance after unstaking')

		// check updated Balance of Decentral Bank
		result = await tether.balanceOf(decentralBank.address)
		assert.equal(result.toString(), tokens('0'), 'decentral bank mock wallet balance')

		// Is staking balance
		result = await decentralBank.isStaking(customer)
		assert.equal(result.toString(), 'false', 'customer is no longer staking status after ..')


		})
	})
})