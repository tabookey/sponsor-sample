let {SponsorProvider} = require('gsn-sponsor');
let IRelayHub = artifacts.require( 'IRelayHub')
const {expectEvent, BN, expectRevert} = require('@openzeppelin/test-helpers');


let Asd = artifacts.require("asd.sol");
let FreeRecipientSponsor = artifacts.require('FreeRecipientSponsor');

let relayHubAddress = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";

let verbose = false;

contract("via sponsor", async ([from, another]) => {
    let v, rh;
    let provider, gsnForwarder;
    let key = SponsorProvider.newEphemeralKeypair();
    before("init relay, sponsor", async () => {

        sponsor = await FreeRecipientSponsor.new({gas: 5e6});

        await sponsor.setRelayHub(relayHubAddress);
        await sponsor.relayHubDeposit({value: 1e18});

        provider = new SponsorProvider(global.web3.currentProvider, {
            verbose,
            // force_gasLimit: 2e6,
            sponsor: sponsor.address,
            proxyOwner: key
        });
        gsnForwarder = await provider.getGsnForwarder();

        console.log("key addr=", key.address);
        asd = await Asd.new();
        await asd.setGsnForwarder(gsnForwarder);
        Asd.web3.setProvider(provider)
    });

    it( "wrong sender fails on wrong signature", async()=>{
        await expectRevert( asd.inc({from:from}) , "WrongSignature");
    })

    it("inc", async () => {

        assert.equal( await asd.getHubAddr(), relayHubAddress )
        assert.equal( await asd.getGsnForwarder(), gsnForwarder )
        let res = await asd.inc({from:key.address})
        assert.equal(await asd.counter(), 1);
        expectEvent(res, "Incremented", {counter: new BN(1)});

        relayLogs = {logs: IRelayHub.decodeLogs(res.receipt.rawLogs)}

        expectEvent(relayLogs, "TransactionRelayed", {status: "0"} );

    })
});
