public abstract class CardDecorator implements Card {
    protected Card card;

    public CardDecorator(Card card) {
        this.card = card;
    }

    @Override
    public String getInfo() {
        return card.getInfo();
    }
}
