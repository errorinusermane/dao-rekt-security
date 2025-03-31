// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title VulnerableBank - 재진입 공격에 취약한 예제 컨트랙트
contract VulnerableBank {
    mapping(address => uint256) public balances;

    /// @notice 입금 함수. 사용자 잔액을 기록
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /// @notice 출금 함수. 재진입 공격에 취약함
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Insufficient balance");

        // ⚠️ 문제점: 외부 호출을 먼저 실행한 후, 상태값을 나중에 변경
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");

        // 공격자는 이 전에 다시 withdraw()를 호출 가능
        balances[msg.sender] = 0;
    }

    /// @notice 수신 전용 함수 (fallback 아님)
    receive() external payable {}
}