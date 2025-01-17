import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Carousel, Col, Row, Image, Container, ListGroup, Button, Table } from 'react-bootstrap'
import { AuctionStatus, ApprovalStatus, ScopeReference } from '../components/Utils'
// import { exponent } from '../utils/Constants'
import { Web3Context } from '../App'
import { BsFillPersonVcardFill, BsCoin } from 'react-icons/bs'
import RegisterAuctionModal from '../components/RegisterAuctionModal'
import NotificationAlert from '../components/NotificationAlert'

const Detail = () => {
  const { program } = useContext(Web3Context);
  const { account } = useContext(Web3Context);

  const { address } = useParams()
  const [data, setData] = useState(null)
  const [bids, setBids] = useState(null)
  const [owner, setOwner] = useState(null)
  const [approved, setApproved] = useState(null)
  const [isOwner, setIsOwner] = useState(true)

  const handleEffect = async () => {
    if (program) {
      const data = await program.account.vehicleData.fetch(address).catch(error => console.log(error));
      setData(data)

      const bids = await data.bids
      setBids(bids)

      const owner = await data.ownerAddress.toString()
      setOwner(owner)

      const approved = await data.isApproved
      setApproved(approved);

      const isOwner = await (account && account.toString() == owner)
      setIsOwner(isOwner)
    }
  }

  useEffect(() => {
    handleEffect()
  }, [program, bids])

  const renderImages = () => {
    const images = []
    data?.vehicleImages.forEach(element =>
      images.push(<Carousel.Item>
        <Image thumbnail src={element} style={{ width: '100%', height: '400px' }} />
      </Carousel.Item>))
    return images
  }

  const renderTable = () => {
    const rows = []
    data?.bids.forEach(element =>
      rows.push(
        <tr>
          <td> {element.index} </td>
          <td> <ScopeReference hexString={element.bidder.toString()} type='address' /> </td>
          <td> {element.quantity} SOL </td>
          {/* <td> {new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(element.bidDate)}</td> */}
          <td> {element.isWithdrawn ? 'Yes' : 'No'}</td>
        </tr>
      ))
    return rows
  }

  const notificationRef = useRef(null)
  const enableShow = (alert) => (notificationRef.current).setShow(alert)

  return (
    <div>
      <Container fluid>
        <NotificationAlert ref={notificationRef} />
        <Row>
          <Col xl={6}>
            <Carousel className='mb-3'>
              {renderImages()}
            </Carousel>

            <div>
              <p className='h5'>Auction Results</p>

              <div className='mb-2 d-flex align-items-center'>
                <BsCoin size={24} className='me-2' />  {data?.startingPrice} SOL
              </div>
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Bidder</th>
                    <th>Quantity</th>
                    {/* <th>Time</th> */}
                    <th>Withdrawn</th>
                  </tr>
                </thead>

                {
                  bids?.length == 0 ?
                    <tbody>
                      <tr>
                        <td colSpan={5} className='text-center'> No matching records found </td>
                      </tr>
                    </tbody>
                    :
                    <tbody>
                      {renderTable()}
                    </tbody>
                }

              </Table>
              {account != "884F5oM5r8f6HXsNZpXpTVRWKqt3iiwrKbnXsXuQvEsM" && !isOwner && data?.isStart ?
                <div className='d-flex float-end'>

                  <RegisterAuctionModal
                    address={address}
                    enableShow={enableShow}
                    bids={bids}
                    startingPrice={data.startingPrice}
                    setBids={setBids}
                    className='me-3' />

                  <Button variant='outline-danger' disabled={bids?.length == 0}
                    onClick={async () => {
                      const txHash = await program.methods
                        .withdrawBid()
                        .accounts({
                          vehicle: address,
                          authority: account,
                        })
                        .rpc().catch(error => console.log(error))

                      try {
                        enableShow({
                          hasShow: true,
                          variant: 'success',
                          content: <div>
                            {txHash
                              ? <>A bid has been withdrawn. Transaction hash: < ScopeReference hexString={txHash} type='transaction' /></>
                              : 'Transaction failed'
                            }
                          </div>
                        })
                      } catch (e) {
                        console.log(e)
                      }
                      const bids = (await program.account.vehicleData.fetch(address)).bids
                      setBids(bids)
                    }}>
                    Withdraw </Button>
                </div>
                : <div> </div>}
              {account != "884F5oM5r8f6HXsNZpXpTVRWKqt3iiwrKbnXsXuQvEsM" && isOwner && data?.isStart ? <div className='d-flex float-end'>
                <Button variant='danger'
                  onClick={
                    async () => {
                      const txHash = await program.methods
                        .endAuction()
                        .accounts({
                          vehicle: address,
                          owner: account
                        })
                        .rpc().catch(error => console.log(error))
                      try {
                        enableShow({
                          hasShow: true,
                          variant: 'success',
                          content: <div>
                            {txHash
                              ? <>An auction has been ended. Transaction hash: < ScopeReference hexString={txHash} type='transaction' /></>
                              : 'Transaction failed'
                            }
                          </div>
                        })
                      } catch (e) {
                        console.log(e)
                      }
                    }
                  }
                > End Auction </Button>
              </div> : <div> </div>}
              {account == "884F5oM5r8f6HXsNZpXpTVRWKqt3iiwrKbnXsXuQvEsM" && !approved ?
                <div className='d-flex float-end'>
                  <Button variant='success'
                    onClick={async () => {
                      const txHash =
                        await program.methods
                          .approveVehicle()
                          .accounts({
                            vehicle: address,
                            authority: account,
                          })
                          .rpc().catch(error => console.log(error))

                      setApproved(true);
                      try {
                        enableShow({
                          hasShow: true,
                          variant: 'success',
                          content: <div>
                            {txHash
                              ? <>A car has been approved. Transaction hash: < ScopeReference hexString={txHash} type='transaction' /></>
                              : 'Transaction failed'
                            }
                          </div>
                        })
                      } catch (e) {
                        console.log(e)
                      }
                    }
                    }
                  > Approve </Button>
                </div> : <div> </div>}
            </div>
          </Col>
          <Col xl={6}>
            <div className='mb-2'>
              <ScopeReference
                hexString={address}
                className='h4'
                type='address' />

            </div>
            <ApprovalStatus className='mb-2' type={approved} />
            <AuctionStatus className='mb-2' type={data?.isStart} />
            {
              owner != null ? <div className='mb-3 d-flex text-align-center'> <BsFillPersonVcardFill size={24} className='me-2' /> <ScopeReference
                hexString={owner}
                type='address' />
              </div> : <div> </div>
            }

            <ListGroup className='mb-3'>
              <ListGroup.Item><b>Owner Full Name: </b>{data?.props.ownerFullName}</ListGroup.Item>
              <ListGroup.Item><b>Owner Address: </b>{data?.props.ownerAddress}</ListGroup.Item>
              <ListGroup.Item><b>Brand: </b>{data?.props.brand}</ListGroup.Item>
              <ListGroup.Item><b>Vehicle Type: </b>{data?.props.vehicleType}</ListGroup.Item>
              <ListGroup.Item><b>Color: </b>{data?.props.color}</ListGroup.Item>
              <ListGroup.Item><b>Seat Capacity: </b>{data?.props.seatCapacity}</ListGroup.Item>
              <ListGroup.Item><b>Origin: </b>{data?.props.origin}</ListGroup.Item>
              <ListGroup.Item><b>License Plate: </b>{data?.props.licensePlate}</ListGroup.Item>
              <ListGroup.Item><b>Engine Number: </b>{data?.props.engineNumber}</ListGroup.Item>
              <ListGroup.Item><b>Chassis Number: </b>{data?.props.chassisNumber}</ListGroup.Item>
              <ListGroup.Item><b>Model Code: </b>{data?.props.modelCode}</ListGroup.Item>
              <ListGroup.Item><b>Capacity: </b>{data?.props.capacity}</ListGroup.Item>
              <ListGroup.Item><b>First Registration Date: </b>{data?.props.firstRegistrationDate}</ListGroup.Item>
              {/* <ListGroup.Item><b>First Registration Date: </b>{new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(data?.props.firstRegistrationDate)}</ListGroup.Item> */}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div >
  )
}
export default Detail
