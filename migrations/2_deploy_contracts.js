const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

module.exports = async function(deployer, network, accounts) {
	// Deploy Mock Tether Tokens
	await deployer.deploy(Tether)
	const tether = await Tether.deployed()

	// Deploy RWD Token
	await deployer.deploy(RWD) 
	const rwd = await RWD.deployed()

	// Deploy DecentralBank Contract
	await deployer.deploy(DecentralBank, rwd.address, tether.address)
	const decentralBank = await DecentralBank.deployed()

	// Transfer all RWD tokens to Decentral Bank
	await rwd.transfer(decentralBank.address, '1000000000000000000000000') // 18 0s + 6 0s = 24 0s (To make 1 million)

	// Distribute 100 Tether tokens to invester
	await tether.transfer(accounts[1], '100000000000000000000') // 18 0s (100 tether tokens)
};