// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "./MyERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract StudentSocietyDAO {

    uint256 constant public VOTE_AMOUNT = 50;
    uint256 constant public PROPOSAL_AMOUNT = 500;

    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        string content;
        uint32 voteNumber; // the number of votor
        uint32 agreement;
        bool isend;
        bool ispass;
        mapping (address=>bool) option;
        mapping(address => bool) voterList;
    }

    uint32 public proposalNumber; // number of proposal 
    MyERC20 public studentERC20; 
    MyERC721 public myERC721;

    mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal
    mapping(address=>uint32) memberCount;
    
    function getMemberCount(address account)public returns(uint32){
        return memberCount[account];
    }

    constructor() {
        // maybe you need a constructor
        studentERC20 = new MyERC20("ZJUToken", "ZJUTokenSymbol");
        myERC721 = new MyERC721("ZJUToken", "ZJUTokenSymbol");
        proposalNumber = 0; 
    }


    //creat a new proposal
    function newProposal(string memory name, string memory content, uint256 duration)public{
        studentERC20.transferFrom(msg.sender, address(this), PROPOSAL_AMOUNT);
        proposalNumber++;
        Proposal storage n = proposals[proposalNumber];
        n.index = proposalNumber;
        n.agreement = 0;
        n.content = content;
        n.duration = duration;
        n.isend = false;
        n.ispass = false;
        n.name = name;
        n.proposer = msg.sender;
        n.startTime = block.timestamp;
        n.voteNumber = 0;
        // proposals[proposalNumber]=Proposal(proposalNumber,msg.sender,block.timestamp,duration,name,content,0,0,false,false);
    }

    // get the number of poposal
    function getProposalNumber()public returns(uint32){
        return proposalNumber;
    }

    struct data {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        string content;
        uint32 voteNumber; // the number of votor
        uint32 agreement;
        bool isend;
        bool ispass;
    }

    data[] ids;
    //get the ids for proposal
    function getProposalID()public returns(data[] memory){
        delete ids;
        for(uint32 i = 1; i <= proposalNumber;i++)
        {
            Proposal storage _proposal = proposals[i];
            ids.push(data(
                _proposal.index,
                _proposal.proposer,
                _proposal.startTime,
                _proposal.duration,
                _proposal.name,
                _proposal.content,
                _proposal.voteNumber,
                _proposal.agreement,
                _proposal.isend,
                _proposal.ispass
            ));
        }
        return ids;
    }

    //vote
    function vote(bool option,uint32 proposalid)public{
        check();
        studentERC20.transferFrom(msg.sender, address(this), VOTE_AMOUNT);
        Proposal storage _proposal = proposals[proposalid];
        
        // only once
        require(_proposal.voterList[msg.sender] == false, "This user has voted already");
        _proposal.voterList[msg.sender]=true;

        require((_proposal.isend!=true) && (_proposal.startTime + _proposal.duration > block.timestamp), "Voting has closed.");
        if(((_proposal.isend==false)))   //the proposal is not over
        {
            _proposal.voteNumber++;
            if(option == true)
            {
                _proposal.agreement++;
            }
            _proposal.option[msg.sender]=option;
        }
    }

    //end the proposal 
    function check()public{
        for(uint32 i = 1; i<=proposalNumber; i++)
        {
            Proposal storage _proposal = proposals[i];
            if((_proposal.isend == false) && (_proposal.startTime + _proposal.duration <= block.timestamp))       // is not end 
            {
                _proposal.isend = true;
                if(_proposal.agreement > (_proposal.voteNumber/2))      // pass
                {
                    _proposal.ispass = true;
                    uint32 count = 2*_proposal.voteNumber-1;    // voteNumber != 0
                    studentERC20.transfer(_proposal.proposer, PROPOSAL_AMOUNT+ count*VOTE_AMOUNT);
                    memberCount[_proposal.proposer] ++;
                    if(memberCount[_proposal.proposer]%3==0)
                    {
                        myERC721.bonus(_proposal.proposer);
                    } 
                }
            }
        }
    }
}
