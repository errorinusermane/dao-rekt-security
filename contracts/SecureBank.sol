// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title SecureBank - 재진입 공격을 방어하는 보안 컨트랙트
contract SecureBank is ReentrancyGuard {
    mapping(address => uint256) public balances;

    /// @notice 입금 함수. 사용자 잔액 증가
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /// @notice 안전한 출금 함수. 재진입 공격 방지
    /// @dev nonReentrant modifier로 중첩 호출 차단
    function withdraw() public nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Insufficient balance");

        // 상태 먼저 변경 (Checks-Effects-Interactions)
        balances[msg.sender] = 0;

        // 이후 외부 호출
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}
}