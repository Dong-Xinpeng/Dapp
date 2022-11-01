import {Button, Image,Input,message,TimePicker,Table,InputNumber, Result } from 'antd';
import {UserOutlined,LaptopOutlined,NotificationOutlined} from "@ant-design/icons";
import {useContext, useEffect, useState} from 'react';
import React,{Fragment,PureComponent} from 'react';
import {StudentSocietyDAOContract, myERC20Contract, myERC721Contract, web3} from "../utils/contracts";
import './index.css';
import internal from 'stream';


const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'
const { TextArea } = Input;


var StudentSocietyDAOPage = () =>{
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [voteAmount, setVoteAmount] = useState(50)
    const [proposalAmount, setProposalAmount] = useState(500)
    const [proposalNumber, setProposalNumber] = useState(0)
    const [newProposalTitle, setNewProposalTitle] = useState('')
    const [newProposalContent, setNewProposalContent] = useState('')
    const [duration, setDuration] = useState(0)
    const [memberCount, setMemberCount] = useState(0)
    const [bounsCount, setBounsCount] = useState(0)
    const [dataIndex,setDataIndex] = useState<any[]>([]);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getLotteryContractInfo = async () => {
            if (StudentSocietyDAOContract) {
                // 将方法导入
                const va = await StudentSocietyDAOContract.methods.VOTE_AMOUNT().call()
                setVoteAmount(va)
                const pa = await StudentSocietyDAOContract.methods.PROPOSAL_AMOUNT().call()
                setProposalAmount(pa)
                const pn = await StudentSocietyDAOContract.methods.getProposalNumber().call()
                setProposalNumber(pn)
                const ind = await StudentSocietyDAOContract.methods.getProposalID().call()
                setDataIndex(ind)
                const mc = await StudentSocietyDAOContract.methods.getMemberCount(account).call()
                setMemberCount(mc)
            } else {
                alert('Contract not exists.')
            }
            if(myERC721Contract){
                const bc = await myERC721Contract.methods.balanceOf(account).call()
                setBounsCount(bc)
            }
        }

        getLotteryContractInfo()
    }, [account])


    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                // alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert("您已经领取过")
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onNewProposal = async (title:string,content:string,duration:number) =>{
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (StudentSocietyDAOContract && myERC20Contract) {
            try{
                await myERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, proposalAmount).send({
                    from: account
                })
                await StudentSocietyDAOContract.methods.newProposal(title,content,duration).send({
                    from: account
                })
                const mc = await StudentSocietyDAOContract.methods.getMemberCount(account).call()
                setMemberCount(mc)
                const pn = await StudentSocietyDAOContract.methods.getProposalNumber().call()
                setProposalNumber(pn)
                const ind = await StudentSocietyDAOContract.methods.getProposalID().call()
                setDataIndex(ind)

            }catch (error: any) {
                alert(error.message)
            }
        }
    }

    const refresh = async()=>{
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if(StudentSocietyDAOContract && myERC20Contract){
            try{
                await myERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, 0).send({
                    from: account
                })
                await StudentSocietyDAOContract.methods.check().send({
                    from: account
                })
                const mc = await StudentSocietyDAOContract.methods.getMemberCount(account).call()
                setMemberCount(mc)
                const pn = await StudentSocietyDAOContract.methods.getProposalNumber().call()
                setProposalNumber(pn)
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                const bc = await myERC721Contract.methods.balanceOf(account).call()
                setBounsCount(bc)
                const ind = await StudentSocietyDAOContract.methods.getProposalID().call()
                setDataIndex(ind)
            }catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const columns = [
        { title: '提案名', dataIndex: 'name', key: 'name' },
        // { title: '提案内容', dataIndex: 'content', key: 'content' },
        { title: '开始时间', dataIndex: 'startTime', key: 'startTime'},
        { title: '持续时间', dataIndex: 'duration', key: 'duration' },
        { title: '发起者', dataIndex: 'proposer', key: 'proposer' ,width:300},
        { title: '总投票数', dataIndex: 'voteNumber', key: 'voteNumber' },
        { title: '赞同数', dataIndex: 'agreement', key: 'agreement' },
        { title: '是否结束', dataIndex: 'isend', key: 'isend' },
        { title: '是否通过', dataIndex: 'ispass', key: 'ispass' },
        { title: 'Action', dataIndex: 'agree', key: 'y', render: (text:any, record:any) => 
        <a onClick={() => {
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (StudentSocietyDAOContract && myERC20Contract) {
                try{
                    myERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, voteAmount).send({
                        from: account
                    })
                    StudentSocietyDAOContract.methods.vote(true,record.key).send({
                        from: account
                    })
                    // const ind = StudentSocietyDAOContract.methods.getProposalID().call()
                    // setDataIndex(ind)
                }catch (error: any) {
                    alert(error.message)
                }
                // alert("投票成功")
            }else{
                alert('Contract not exists.')
            }
        }}href="#">同意</a> },
        { title: 'Action', dataIndex: 'disagree', key: 'n', render: (text:any, record:any) => 
        <a onClick={() => {
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (StudentSocietyDAOContract && myERC20Contract) {
                try{
                    myERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, voteAmount).send({
                        from: account
                    })
                    StudentSocietyDAOContract.methods.vote(false,record.key).send({
                        from: account
                    })
                    // const ind = StudentSocietyDAOContract.methods.getProposalID().call()
                    // setDataIndex(ind)
                    
                }catch (error: any) {
                    alert(error.message)
                    alert("投票失败")
                }
                alert("投票成功")
            }else{
                alert('Contract not exists.')
            }
        }} href="#">不同意</a> },
      ];
    
    var data = [
        { key: 1, name: '0', duration: 1, description: 'My ',startTime:0, proposer:0,voteNumber:0,agreement:0,isend:"false",ispass:"false"},
      ];
    
    const GetData=()=>{
        data=[];
        dataIndex.forEach(function aa(item,index,originArry){
            data.push({
                "key":index+1,
                "name" : item[4],
                // "content" : item[5],
                "startTime" : item[2],
                "duration" : item[3],
                "proposer" : item[1],
                "voteNumber" : item[6],
                "agreement" : item[7],
                "isend" : item[8]?"已结束":"未结束",
                "ispass" : item[9]?"通过":"不通过",
                "description" : item[5],
            })
        })
        console.log("data",data)
        // console.log("dataIndex",dataIndex)
        return(
            <div>
                <Table
                    columns={columns}
                    expandedRowRender={record => <p>{record.description}</p>}
                    dataSource={data}
                    pagination={{ pageSize: 5 }} 
                    bordered = {true}
                    scroll={{ y: 300 }}
                />
            </div>
        )
    }
    
    return (
        <div className='container'>
            <div className='main'>
                <h1>社团提案管理页面</h1>
                <Button onClick={onClaimTokenAirdrop}>领取浙大币空投</Button>
                <Button onClick={refresh}>查看最新状态</Button>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有浙大币数量：{account === '' ? 0 : accountBalance}  通过提案数量：{memberCount}   纪念品数量：{bounsCount}</div>
                </div>
                
                <div className='operation'>
                    
                    <Input
                            style={{ width: 400}}
                            className="new_proposal_title"
                            placeholder="提案名"
                            // prefix={<UserOutlined />}  //前面的图标
                            onChange={(event) => {
                                setNewProposalTitle(event.target.value);
                            }}
                        />
                    <div style={{ margin: '5px' }} />
                    <TextArea 
                        rows={3} 
                        className="new_proposal_content"
                        placeholder="提案内容"
                        style={{ width: 400 }}
                        // prefix={<UserOutlined />}  //前面的图标
                        onChange={(event) => {
                            setNewProposalContent(event.target.value);
                        }}
                    />
                    <div style={{ margin: '5px' }} />
                    <InputNumber 
                            style={{ width: 200 }}  
                            className="duration"
                            placeholder="有效时间(s)"
                            min={1} 
                            onChange={(value) => {setDuration(Number(value));}}
                        />
                    <div style={{ margin: '5px' }} />
                    <div className='buttons'>
                        <Button style={{ width: 200 }}  onClick={(e)=>onNewProposal(newProposalTitle,newProposalContent,duration)}>花费{proposalAmount}发起提案</Button>
                    </div>
                    
                    <div>
                        <LaptopOutlined /> 已有{proposalNumber}个提案
                    </div>
                    <GetData/>
                    
                </div>
            </div>
        </div>
    )
}

export default StudentSocietyDAOPage