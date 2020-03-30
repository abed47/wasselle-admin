import React,{Component} from 'react';
import {
    Container, 
    Row, 
    Col, 
    Pagination, 
    Card, 
    CardHeader, 
    Table, 
    CardBody,
    Badge,
    Button,
    PaginationItem,
    PaginationLink,
    ButtonGroup,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter
} from 'reactstrap'
import {fb} from '../../firebase';

let fs = fb.firestore();

class Orders extends Component{

    constructor(props){
        super(props);
        this.state = {
            listItems: [],
            currentPage: 1,
            currentPageItems:[],
            pageCount: 0,
            canelModalShow: false,
            doneModalShow: false,
            viewOrderModalShow: true,
            showLoading:false,
            selectedOrderId: '',
            selectedCartData: {}
        }
    }


    componentDidMount(){
        this.getOrderData()
    }

    async getOrderData(){
        let orders =[];
        let canceledOrders =[];
        let pendingOrders = [];
        let deliveredOrders = [];
        let ordersRef = await fs.collection('orders');

        ordersRef.orderBy('date','desc').get().then(docs => {
            if(docs.empty){
                return
            }

            docs.forEach(doc => {
                let obj = doc.data();
                obj.id = doc.id;
                orders.push(obj);
                if(obj.status === 'done'){
                    deliveredOrders.push(obj)
                }

                if(doc.status === 'pending'){
                    pendingOrders.push(obj)
                }

                if(obj.status === 'canceled'){
                    canceledOrders.push(obj)
                }
            })
        }).then(() => {
            this.setState({
                listItems : orders,
                pageCount: Math.ceil(orders.length / 7)
            },() => {
                this.changeCurrentPageItems(this.state.listItems,this.state.currentPage)
            })
        })


    }

    async getUserData(id){
        let ref = await fs.collection('users');
        let user = {}
        await ref.doc(id).get().then(doc => {
            user = doc.data()
        });
        return user
    }

    toDateTime(date){
        let d = new Date(date);
        let now = new Date().getTime();
        let def = now - date;
        if(def < 60000){
            return `${Math.floor(def/1000)} sec`
        }

        if(def < 3600000){
            let m = Math.floor(def/60000)
            return `${m} min`
        }

        if(def < 86400000){
            let h = Math.floor(def / 3600000)
            return `${h} h`
        }

        if(def > 86400 && def < 604800000){
            let days = Math.floor(def / 86400000);
            return `${days} days`
        }

        return `${d.getDate()} / ${d.getMonth() + 1}`;
        
    }

    async showCartItem(cart){
        console.log(cart)
    }

    PaginationItems(count){
        let pageinationLinks = []
        for(let i = 0; i < count; ++i){
            pageinationLinks.push(
                <PaginationItem key={i} active={i + 1 === this.state.currentPage ? true : false} >
                    <PaginationLink tag="button" onClick={() => this.setCurrentPageIndex(i + 1)} >{i + 1}</PaginationLink>
                </PaginationItem>
            )
        }
        return pageinationLinks
    }

    setCurrentPageIndex(i){
        this.setState({
            currentPage: i
        },() => {
            this.changeCurrentPageItems(this.state.listItems,i)
        })
    }

    changeCurrentPageItems(items,pIndex){
        let startIndex = pIndex === 1 ? 0 : pIndex * 7 - 7;
        let endIndex = startIndex === 0 ? 7 : startIndex + 7
        let pItems = items.slice(startIndex, endIndex)
        this.setState({
            currentPageItems : pItems
        })
    }

    handleClickNext(){
        let currIndex = this.state.currentPage;
        let pCount = this.state.pageCount;
        if(currIndex === pCount){
            this.setCurrentPageIndex(1);
            return;
        }
        this.setCurrentPageIndex(currIndex + 1)
    }

    handleClickPrev(){
        let currIndex = this.state.currentPage;
        let pCount = this.state.pageCount;
        if(currIndex === 1){
            this.setCurrentPageIndex(pCount);
            return;
        }
        this.setCurrentPageIndex(currIndex - 1)
    }

    handleOrderDone(id){
        this.setState({
            selectedOrderId: id
        })
        this.toggleDeliverModal()
    }

    handleOrderCancel(id){
        this.setState({
            selectedOrderId: id
        })
        this.toggleCancelModal()
    }

    handleOrderView(id){

    }

    toggleOrderViewModal(){
        this.setState({
            viewOrderModalShow : !this.state.viewOrderModalShow
        })
    }

    toggleCancelModal(){
        this.setState({
            canelModalShow : !this.state.canelModalShow
        })
    }

    toggleDeliverModal(){
        this.setState({
            doneModalShow : !this.state.doneModalShow
        })
    }

    toggleLoadingModal(){
        this.setState({
            showLoading: !this.state.showLoading
        })
    }

    async cancelOrder(id){
        this.toggleCancelModal()
        this.toggleLoadingModal();
        let ref = await fs.collection('orders');
        ref.doc(id).update({
            status: "cancel"
        }).then(() => {
            this.setState({
                selectedOrderId: ''
            })
            this.getOrderData()
            this.toggleLoadingModal()
        })
    }

    async deliverOrder(id){
        this.toggleDeliverModal()
        this.toggleLoadingModal();
        let ref = await fs.collection('orders');
        ref.doc(id).update({
            status: "done"
        }).then(() => {
            this.setState({
                selectedOrderId: ''
            })
            this.getOrderData()
            this.toggleLoadingModal()
        })
    }

    render() {
        return(
            <div className="animated fadeIn">
            <Container>
                <div>

                <Modal isOpen={this.state.canelModalShow} >
                    <ModalHeader toggle={() => this.toggleCancelModal()}>Cancel Order</ModalHeader>
                    <ModalBody>
                        Are you sure you want to cancel this order?
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={() => this.cancelOrder(this.state.selectedOrderId)}>Cancel Order</Button>{' '}
                    <Button color="secondary" onClick={() => this.toggleCancelModal()}>Close</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.doneModalShow} >
                    <ModalHeader toggle={() => this.toggleDeliverModal()}>Modal title</ModalHeader>
                    <ModalBody>
                        Are you sure you delivered this order?
                    </ModalBody>
                    <ModalFooter>
                    <Button color="success" onClick={() => this.deliverOrder(this.state.selectedOrderId)}>Yes</Button>{' '}
                    <Button color="secondary" onClick={() => this.toggleDeliverModal()}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                <Modal className="mt-5" isOpen={this.state.showLoading} >
                    <ModalHeader >Proccessing request</ModalHeader>
                    <ModalBody className="d-flex justify-content-center align-items-center">
                    <i className="fa fa-cog fa-spin  text-primary font-4xl m-2"></i>
                    </ModalBody>
                </Modal>
                </div>

                <Row>
                    <Col xs="12" sm="12" md="10" lg="10" offset="1">
                        <Card>
                        <CardHeader>
                            <i className="fa fa-shopping-basket"></i> Orders
                        </CardHeader>
                        <CardBody>
                            <Table responsive striped>
                            <thead>
                            <tr>
                                <th>Username</th>
                                <th>Date</th>
                                <th>cart</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.currentPageItems.map(item => {
                                    return(
                                        <tr key={item.id}>
                                        <td>{!item.user ? '' : item.user.phoneNumber}</td>
                                        <td>{this.toDateTime(item.date)} <i className="fa fa-clock-o text-warning"></i> </td>
                                        <td><Button onClick={() => this.showCartItem(item.cart)} color="primary" className="p-1" ><i className="icon-eye icons m-0"></i></Button></td>
                                        <td>
                                            {
                                                item.status === 'done' ?
                                                <Badge color="success">Delivered</Badge>
                                                : (
                                                    item.status === 'cancel' ?
                                                    <Badge color="danger">Canceled</Badge>
                                                    : <Badge color="warning">Pending</Badge>
                                                )
                                            }
                                        </td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button onClick={() => this.handleOrderCancel(item.id)}><i className="cui-ban icons font-2 d-block text-danger"></i></Button>
                                                <Button onClick={() => this.handleOrderDone(item.id)}><i className="cui-circle-check icon font-2 d-block text-success>"></i></Button>
                                            </ButtonGroup>
                                        </td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                            </Table>
                            <Pagination>
                                <PaginationItem>
                                    <PaginationLink previous tag="button" onClick={() => this.handleClickPrev()}></PaginationLink>
                                </PaginationItem>
                                {
                                    this.PaginationItems(this.state.pageCount)
                                }
                                <PaginationItem>
                                    <PaginationLink next tag="button" onClick={() => this.handleClickNext()}></PaginationLink>
                                </PaginationItem>
                            </Pagination>
                        </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
            </div>
        )
    }
}

export default Orders;