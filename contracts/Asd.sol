pragma solidity ^0.5.10;

import "gsn-sponsor/contracts/GsnRecipient.sol";
import "gsn-sponsor/contracts/FreeRecipientSponsor.sol";

contract Asd is GsnRecipient {

	uint public counter;
	event Incremented(uint counter);

	function inc() public {
		counter++;
		emit Incremented(counter);
	}

	function _acceptCall( address from, bytes memory encodedFunction) view internal returns (uint256 res, bytes memory data) {
		(from,encodedFunction, res, data);
	}

}

library initasd {
	function create() internal {
		new Asd();
	}
}